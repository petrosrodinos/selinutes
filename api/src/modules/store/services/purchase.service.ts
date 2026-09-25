import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'
import { OrderStatus, PaymentMethod, Prisma, ProductType } from 'generated/prisma'
import { PrismaService } from '@/core/databases/prisma/prisma.service'
import { StripeConfig } from '@/integrations/stripe/stripe.config'
import { StripePaymentsService } from '@/integrations/stripe/services/stripe-payments.service'
import { StripePaymentsWebhooksService } from '@/integrations/stripe/services/stripe-payments-webhooks.service'
import { StripePaymentContext } from '@/integrations/stripe/interfaces/stripe-payments.interface'
import { ORDER_INCLUDE } from '../constants/store-queries.constants'
import {
    STORE_APP_ROUTES,
    STORE_CURRENCY,
    STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER,
    STRIPE_PAID_EVENT_TYPES,
} from '../constants/store.constants'
import { OrderEntry, PurchaseResult } from '../interfaces/store.interface'
import { buildCheckoutUrls, buildPaymentSummary, getPointsDiscount, getStripePaymentIntentId, toOrderEntry } from '../helpers/store.helper'
import { AppConfigService } from './app-config.service'

@Injectable()
export class PurchaseService {
    private readonly logger = new Logger(PurchaseService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly stripeConfig: StripeConfig,
        private readonly stripePayments: StripePaymentsService,
        private readonly stripeWebhooks: StripePaymentsWebhooksService,
        private readonly appConfig: AppConfigService,
    ) { }

    async purchase(userUuid: string, productUuid: string, requestedPoints: number): Promise<PurchaseResult> {
        const product = await this.prisma.product.findUnique({ where: { uuid: productUuid } })

        if (!product) {
            throw new NotFoundException('Product not found')
        }

        if (product.type !== ProductType.digital) {
            throw new BadRequestException('Only digital products can be purchased right now')
        }

        const mockPayments = this.configService.get<string>('STORE_MOCK_PAYMENTS') !== 'false'
        const appUrl = this.configService.get<string>('APP_URL')
        const stripeReady = Boolean(appUrl) && Boolean(this.stripeConfig.getStripeClient())

        const pointsPerCurrencyUnit = await this.appConfig.getPointsPerCurrencyUnit()

        const order = await this.prisma.$transaction(async (tx) => {
            const owned = await tx.order.findFirst({
                where: { user_uuid: userUuid, product_uuid: productUuid, status: OrderStatus.paid },
                select: { id: true },
            })

            if (owned) {
                throw new ConflictException('You already own this product')
            }

            const inStock = await tx.product.findFirst({
                where: { uuid: productUuid, quantity: { gt: 0 } },
                select: { id: true },
            })

            if (!inStock) {
                throw new ConflictException('This product is sold out')
            }

            const existingPending = mockPayments
                ? null
                : await tx.order.findFirst({
                    where: { user_uuid: userUuid, product_uuid: productUuid, status: OrderStatus.pending },
                    select: { id: true, points_used: true },
                })

            if (existingPending && existingPending.points_used > 0) {
                await tx.userStats.update({
                    where: { user_uuid: userUuid },
                    data: { points_spent: { decrement: existingPending.points_used } },
                })
            }

            const stats = await tx.userStats.findUnique({
                where: { user_uuid: userUuid },
                select: { points: true, points_spent: true },
            })

            const wallet = {
                priceCents: product.price,
                availablePoints: Math.max(0, (stats?.points ?? 0) - (stats?.points_spent ?? 0)),
                pointsPerCurrencyUnit,
            }
            const allowed = getPointsDiscount({ ...wallet, maxDiscountPercent: product.max_discount_percent })

            if (requestedPoints > allowed.points_used) {
                throw new BadRequestException(`You can use at most ${allowed.points_used} points on this product`)
            }

            const discount = getPointsDiscount({ ...wallet, maxDiscountPercent: product.max_discount_percent, requestedPoints })

            if (discount.points_used > 0) {
                const charged = await tx.$executeRaw`
                    UPDATE "user_stats"
                    SET "points_spent" = "points_spent" + ${discount.points_used}
                    WHERE "user_uuid" = ${userUuid} AND "points" - "points_spent" >= ${discount.points_used}
                `

                if (charged === 0) {
                    throw new BadRequestException('Not enough points')
                }
            }

            const total = product.price - discount.discount_cents
            const paidNow = mockPayments || total === 0

            if (!paidNow && !stripeReady) {
                throw new ServiceUnavailableException('Online payments are not configured')
            }

            const data = {
                payment_method: PaymentMethod.online,
                status: paidNow ? OrderStatus.paid : OrderStatus.pending,
                paid_at: paidNow ? new Date() : null,
                total,
                points_used: discount.points_used,
                discount_cents: discount.discount_cents,
                price_cents: product.price,
                points_per_currency_unit: pointsPerCurrencyUnit,
                payment_summary: buildPaymentSummary(total, discount.points_used, discount.discount_cents),
                stripe_session_id: null,
            }

            if (paidNow && !(await this.decrementStock(tx, productUuid))) {
                throw new ConflictException('This product is sold out')
            }

            return existingPending
                ? tx.order.update({ where: { id: existingPending.id }, data, include: ORDER_INCLUDE })
                : tx.order.create({
                    data: { ...data, user_uuid: userUuid, product_uuid: productUuid },
                    include: ORDER_INCLUDE,
                })
        })

        if (order.status === OrderStatus.paid) {
            this.logger.warn(
                mockPayments
                    ? `Order ${order.uuid} created WITHOUT payment (STORE_MOCK_PAYMENTS) for user ${userUuid}, ${order.points_used} points used`
                    : `Order ${order.uuid} fully paid with ${order.points_used} points by user ${userUuid}`,
            )

            return { order: toOrderEntry(order), checkout_url: null }
        }

        try {
            const session = await this.stripePayments.createOrderCheckoutSession({
                order_uuid: order.uuid,
                product_name: product.name,
                amount: order.total,
                currency: STORE_CURRENCY,
                ...buildCheckoutUrls(
                    appUrl as string,
                    STORE_APP_ROUTES.ORDERS,
                    STORE_APP_ROUTES.STORE,
                    STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER,
                ),
            })

            if (!session.url) {
                throw new InternalServerErrorException('Failed to create checkout session')
            }

            const updated = await this.prisma.order.update({
                where: { id: order.id },
                data: { stripe_session_id: session.id },
                include: ORDER_INCLUDE,
            })

            this.logger.log(`Checkout session ${session.id} created for order ${updated.uuid} (${updated.points_used} points used)`)

            return { order: toOrderEntry(updated), checkout_url: session.url }
        } catch (error) {
            await this.releasePendingOrderPoints(order.id, userUuid, product.price)
            throw error
        }
    }

    private async releasePendingOrderPoints(orderId: number, userUuid: string, priceCents: number): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id: orderId }, select: { points_used: true } })

            if (!order || order.points_used === 0) return

            await tx.userStats.update({
                where: { user_uuid: userUuid },
                data: { points_spent: { decrement: order.points_used } },
            })
            await tx.order.update({
                where: { id: orderId },
                data: { points_used: 0, discount_cents: 0, total: priceCents, payment_summary: buildPaymentSummary(priceCents, 0, 0) },
            })
        })
    }

    async confirmCheckout(userUuid: string, sessionId: string): Promise<OrderEntry> {
        const session = await this.stripePayments.getCheckoutSession(sessionId)
        const orderUuid = session.metadata?.order_uuid

        if (!orderUuid || session.metadata?.context !== StripePaymentContext.STORE_ORDER) {
            throw new NotFoundException('Order not found')
        }

        const order = await this.prisma.order.findFirst({
            where: { uuid: orderUuid, user_uuid: userUuid },
            select: { id: true },
        })

        if (!order) {
            throw new NotFoundException('Order not found')
        }

        if (session.payment_status === 'paid') {
            await this.markOrderPaid(orderUuid, getStripePaymentIntentId(session))
        }

        const refreshed = await this.prisma.order.findUniqueOrThrow({
            where: { id: order.id },
            include: ORDER_INCLUDE,
        })

        return toOrderEntry(refreshed)
    }

    async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<{ received: true }> {
        const event = this.stripeWebhooks.constructEvent(rawBody, signature)

        const isPaidEvent = STRIPE_PAID_EVENT_TYPES.some((type) => type === event.type)

        if (isPaidEvent) {
            const session = event.data.object as Stripe.Checkout.Session
            const orderUuid = session.metadata?.order_uuid
            const isStoreOrder = session.metadata?.context === StripePaymentContext.STORE_ORDER

            if (orderUuid && isStoreOrder && session.payment_status === 'paid') {
                await this.markOrderPaid(orderUuid, getStripePaymentIntentId(session))
            }
        }

        return { received: true }
    }

    async markOrderPaid(orderUuid: string, paymentIntentId: string | null): Promise<void> {
        const marked = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.order.updateMany({
                where: { uuid: orderUuid, status: OrderStatus.pending },
                data: { status: OrderStatus.paid, paid_at: new Date(), stripe_payment_intent_id: paymentIntentId },
            })

            if (updated.count === 0) return false

            const order = await tx.order.findUniqueOrThrow({ where: { uuid: orderUuid }, select: { product_uuid: true } })

            if (!(await this.decrementStock(tx, order.product_uuid))) {
                this.logger.warn(`Order ${orderUuid} was paid but product ${order.product_uuid} is already out of stock`)
            }

            return true
        })

        if (marked) {
            this.logger.log(`Order ${orderUuid} marked as paid`)
        }

        if (paymentIntentId) {
            await this.recordStripeFee(orderUuid, paymentIntentId)
        }
    }

    private async recordStripeFee(orderUuid: string, paymentIntentId: string): Promise<void> {
        const order = await this.prisma.order.findUnique({ where: { uuid: orderUuid }, select: { stripe_fee_cents: true } })

        if (!order || order.stripe_fee_cents !== null) return

        const fee = await this.stripePayments.getPaymentIntentFee(paymentIntentId)

        if (fee === null) return

        await this.prisma.order.update({ where: { uuid: orderUuid }, data: { stripe_fee_cents: fee } })
    }

    private async decrementStock(tx: Prisma.TransactionClient, productUuid: string): Promise<boolean> {
        const decremented = await tx.product.updateMany({
            where: { uuid: productUuid, quantity: { gt: 0 } },
            data: { quantity: { decrement: 1 } },
        })

        return decremented.count > 0
    }
}
