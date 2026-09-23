import { BadGatewayException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { posix } from 'path'
import { OrderStatus, PaymentMethod } from 'generated/prisma'
import { PrismaService } from '@/core/databases/prisma/prisma.service'
import { GcsService } from '@/integrations/storage/gcs/services/gcs.service'
import { ORDER_INCLUDE } from '../constants/store-queries.constants'
import { STORE_DOWNLOAD_URL_EXPIRY_MINUTES, STORE_IMAGE_URL_EXPIRY_MINUTES } from '../constants/store.constants'
import {
    AdminOrderEntry,
    FileDownloadResult,
    OrderEntry,
    OrderGroupSummary,
    StoreOverviewEntry,
} from '../interfaces/store.interface'
import { summarizeOrderGroups, toAdminOrderEntry, toOrderEntry } from '../helpers/store.helper'

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly gcsService: GcsService,
    ) { }

    async getUserOrders(userUuid: string): Promise<OrderEntry[]> {
        const orders = await this.prisma.order.findMany({
            where: { user_uuid: userUuid },
            include: ORDER_INCLUDE,
            orderBy: { created_at: 'desc' },
        })

        return Promise.all(orders.map(async (order) => toOrderEntry(order, await this.getSignedImageUrl(order.product.uuid, order.product.image_path))))
    }

    private async getSignedImageUrl(productUuid: string, path: string | null): Promise<string | null> {
        if (!path) return null

        try {
            return await this.gcsService.getSignedUrl(posix.basename(path), posix.dirname(path), STORE_IMAGE_URL_EXPIRY_MINUTES)
        } catch {
            this.logger.error(`Failed to sign image URL for product ${productUuid}`)
            return null
        }
    }

    async getFileDownloadUrl(userUuid: string, orderUuid: string, fileUuid: string): Promise<FileDownloadResult> {
        const order = await this.prisma.order.findFirst({
            where: { uuid: orderUuid, user_uuid: userUuid, status: OrderStatus.paid },
            select: { product_uuid: true },
        })

        if (!order) {
            throw new NotFoundException('Order not found')
        }

        const file = await this.prisma.productFile.findFirst({
            where: { uuid: fileUuid, product_uuid: order.product_uuid },
        })

        if (!file) {
            throw new NotFoundException('File not found')
        }

        try {
            const url = await this.gcsService.getSignedDownloadUrl({
                path: file.path,
                downloadName: file.name,
                expiresInMinutes: STORE_DOWNLOAD_URL_EXPIRY_MINUTES,
            })

            return { url }
        } catch {
            this.logger.error(`Failed to sign download URL for file ${file.uuid}`)
            throw new BadGatewayException('Failed to prepare file download')
        }
    }

    async getOverview(): Promise<StoreOverviewEntry> {
        const [groups, totalProducts] = await Promise.all([
            this.prisma.order.groupBy({
                by: ['status', 'payment_method'],
                _count: { _all: true },
                _sum: { total: true },
            }),
            this.prisma.product.count(),
        ])

        const summaries: OrderGroupSummary[] = groups.map((group) => ({
            status: group.status,
            payment_method: group.payment_method,
            count: group._count._all,
            total: group._sum.total ?? 0,
        }))

        return summarizeOrderGroups(summaries, totalProducts)
    }

    async getAdminOrders(): Promise<AdminOrderEntry[]> {
        const orders = await this.prisma.order.findMany({
            include: ORDER_INCLUDE,
            orderBy: { created_at: 'desc' },
        })

        return orders.map(toAdminOrderEntry)
    }

    async getAdminOrder(orderUuid: string): Promise<AdminOrderEntry> {
        const order = await this.prisma.order.findUnique({
            where: { uuid: orderUuid },
            include: ORDER_INCLUDE,
        })

        if (!order) {
            throw new NotFoundException('Order not found')
        }

        return toAdminOrderEntry(order)
    }

    async cancelOrder(orderUuid: string): Promise<AdminOrderEntry> {
        const order = await this.prisma.order.findUnique({ where: { uuid: orderUuid } })

        if (!order) {
            throw new NotFoundException('Order not found')
        }

        if (order.status === OrderStatus.cancelled) {
            throw new ConflictException('Order is already cancelled')
        }

        await this.prisma.$transaction(async (tx) => {
            const updated = await tx.order.updateMany({
                where: { uuid: orderUuid, status: order.status },
                data: { status: OrderStatus.cancelled, cancelled_at: new Date() },
            })

            if (updated.count === 0) {
                throw new ConflictException('Order was modified, please retry')
            }

            if (order.status === OrderStatus.paid && order.payment_method === PaymentMethod.points) {
                await tx.userStats.update({
                    where: { user_uuid: order.user_uuid },
                    data: { points_spent: { decrement: order.total } },
                })
            }
        })

        this.logger.log(`Order ${orderUuid} cancelled (was ${order.status}, ${order.payment_method})`)

        return this.getAdminOrder(orderUuid)
    }

    async deleteOrder(orderUuid: string): Promise<{ message: string }> {
        const order = await this.prisma.order.findUnique({ where: { uuid: orderUuid }, select: { id: true } })

        if (!order) {
            throw new NotFoundException('Order not found')
        }

        await this.prisma.order.delete({ where: { id: order.id } })

        this.logger.log(`Order ${orderUuid} deleted`)

        return { message: 'Order deleted successfully' }
    }
}
