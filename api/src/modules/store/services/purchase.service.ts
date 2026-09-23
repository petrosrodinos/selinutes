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
import { OrderStatus, PaymentMethod, ProductType } from 'generated/prisma'
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
import { buildCheckoutUrls, getStripePaymentIntentId, toOrderEntry } from '../helpers/store.helper'

@Injectable()
export class PurchaseService {
    private readonly logger = new Logger(PurchaseService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly stripeConfig: StripeConfig,
        private readonly stripePayments: StripePaymentsService,
        private readonly stripeWebhooks: StripePaymentsWebhooksService,
    ) { }

    async purchase(userUuid: string, productUuid: string): Promise<PurchaseResult> {
        const product = await this.prisma.product.findUnique({ where: { uuid: productUuid } })

        if (!product) {
            throw new NotFoundException('Product not found')
        }

        if (product.type !== ProductType.digital) {
            throw new BadRequestException('Only digital products can be purchased right now')
        }

        if (product.payment_method === PaymentMethod.points) {
            const order = await this.prisma.$transaction(async (tx) => {
                const charged = await tx.$executeRaw`
                    UPDATE "user_stats"
                    SET "points_spent" = "points_spent" + ${product.price}
                    WHERE "user_uuid" = ${userUuid} AND "points" - "points_spent" >= ${product.price}
                `

                if (charged === 0) {
                    throw new BadRequestException('Not enough points')
                }

                const owned = await tx.order.findFirst({
                    where: { user_uuid: userUuid, product_uuid: productUuid, status: OrderStatus.paid },
                    select: { id: true },
                })

                if (owned) {
                    throw new ConflictException('You already own this product')
                }

                return tx.order.create({
                    data: {
                        user_uuid: userUuid,
                        product_uuid: productUuid,
                        payment_method: PaymentMethod.points,
                        status: OrderStatus.paid,
                        total: product.price,
                        paid_at: new Date(),
                    },
                    include: ORDER_INCLUDE,
                })
            })

            this.logger.log(`Order ${order.uuid} paid with ${product.price} points by user ${userUuid}`)

            return { order: toOrderEntry(order), checkout_url: null }
        }

        if (this.configService.get<string>('STORE_MOCK_PAYMENTS') !== 'false') {
            return this.purchaseWithoutPayment(userUuid, productUuid, product.price)
        }

        const appUrl = this.configService.get<string>('APP_URL')

        if (!appUrl || !this.stripeConfig.getStripeClient()) {
            throw new ServiceUnavailableException('Online payments are not configured')
        }

        const owned = await this.prisma.order.findFirst({
            where: { user_uuid: userUuid, product_uuid: productUuid, status: OrderStatus.paid },
            select: { id: true },
        })

        if (owned) {
            throw new ConflictException('You already own this product')
        }

        const existingPending = await this.prisma.order.findFirst({
            where: { user_uuid: userUuid, product_uuid: productUuid, status: OrderStatus.pending },
            select: { id: true, uuid: true },
        })

        const pendingOrder =
            existingPending ??
            (await this.prisma.order.create({
                data: {
                    user_uuid: userUuid,
                    product_uuid: productUuid,
                    payment_method: PaymentMethod.online,
                    status: OrderStatus.pending,
                    total: product.price,
                },
                select: { id: true, uuid: true },
            }))

        const session = await this.stripePayments.createOrderCheckoutSession({
            order_uuid: pendingOrder.uuid,
            product_name: product.name,
            amount: product.price,
            currency: STORE_CURRENCY,
            ...buildCheckoutUrls(
                appUrl,
                STORE_APP_ROUTES.ORDERS,
                STORE_APP_ROUTES.STORE,
                STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER,
            ),
        })

        if (!session.url) {
            throw new InternalServerErrorException('Failed to create checkout session')
        }

        const order = await this.prisma.order.update({
            where: { id: pendingOrder.id },
            data: { stripe_session_id: session.id },
            include: ORDER_INCLUDE,
        })

        this.logger.log(`Checkout session ${session.id} created for order ${order.uuid}`)

        return { order: toOrderEntry(order), checkout_url: session.url }
    }

    private async purchaseWithoutPayment(userUuid: string, productUuid: string, price: number): Promise<PurchaseResult> {
        const owned = await this.prisma.order.findFirst({
            where: { user_uuid: userUuid, product_uuid: productUuid, status: OrderStatus.paid },
            select: { id: true },
        })

        if (owned) {
            throw new ConflictException('You already own this product')
        }

        const order = await this.prisma.order.create({
            data: {
                user_uuid: userUuid,
                product_uuid: productUuid,
                payment_method: PaymentMethod.online,
                status: OrderStatus.paid,
                total: price,
                paid_at: new Date(),
            },
            include: ORDER_INCLUDE,
        })

        this.logger.warn(`Order ${order.uuid} created WITHOUT payment (STORE_MOCK_PAYMENTS) for user ${userUuid}`)

        return { order: toOrderEntry(order), checkout_url: null }
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
        const updated = await this.prisma.order.updateMany({
            where: { uuid: orderUuid, status: OrderStatus.pending },
            data: { status: OrderStatus.paid, paid_at: new Date(), stripe_payment_intent_id: paymentIntentId },
        })

        if (updated.count > 0) {
            this.logger.log(`Order ${orderUuid} marked as paid`)
        }
    }
}
