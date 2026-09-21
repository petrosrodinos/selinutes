import Stripe from 'stripe'
import { PaymentMethod, ProductFile, ProductType, OrderStatus } from 'generated/prisma'
import {
    STORE_IMAGE_MIME_TYPES,
    STORE_MAX_GALLERY_IMAGES,
    STORE_MAX_IMAGE_SIZE_BYTES,
    STORE_MAX_PRODUCT_FILES,
    STORE_MIN_ONLINE_PRICE_CENTS,
} from '../constants/store.constants'
import { OrderWithRelations, ProductWithFiles } from '../constants/store-queries.constants'
import {
    AdminOrderEntry,
    OrderEntry,
    OrderGroupSummary,
    ProductEntry,
    ProductFileEntry,
    ProductGalleryImageEntry,
    StoreOverviewEntry,
    StoreProductEntry,
} from '../interfaces/store.interface'

export const sanitizeFileName = (name: string): string =>
    name.replace(/[\/\0]/g, '_').replace(/[^\w.\- ]/g, '_').trim() || 'file'

export const decodeUploadedFileName = (name: string): string =>
    Buffer.from(name, 'latin1').toString('utf8')

export const getProductPricingError = (paymentMethod: PaymentMethod, price: number): string | null => {
    if (paymentMethod === PaymentMethod.online && price < STORE_MIN_ONLINE_PRICE_CENTS) {
        return `Online price must be at least ${STORE_MIN_ONLINE_PRICE_CENTS} cents`
    }

    return null
}

export const getProductFilesError = (type: ProductType, fileCount: number): string | null => {
    if (type === ProductType.digital && fileCount === 0) {
        return 'Digital products require at least one file'
    }

    if (type !== ProductType.digital && fileCount > 0) {
        return 'Only digital products can have files'
    }

    if (fileCount > STORE_MAX_PRODUCT_FILES) {
        return `A product can have at most ${STORE_MAX_PRODUCT_FILES} files`
    }

    return null
}

export const getProductImageError = (image: { mimetype: string; size: number }): string | null => {
    if (!STORE_IMAGE_MIME_TYPES.some((mimeType) => mimeType === image.mimetype)) {
        return 'Product image must be a JPEG, PNG, WebP or GIF'
    }

    if (image.size > STORE_MAX_IMAGE_SIZE_BYTES) {
        return `Product image must be at most ${STORE_MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} MB`
    }

    return null
}

export const getProductGalleryError = (
    newImages: { mimetype: string; size: number }[],
    finalCount: number,
): string | null => {
    if (finalCount > STORE_MAX_GALLERY_IMAGES) {
        return `A product can have at most ${STORE_MAX_GALLERY_IMAGES} gallery images`
    }

    return newImages.map(getProductImageError).find((error) => error !== null) ?? null
}

export const toProductFileEntry =(file: ProductFile): ProductFileEntry => ({
    uuid: file.uuid,
    name: file.name,
    size: file.size,
    content_type: file.content_type,
})

export const toProductEntry = (
    product: ProductWithFiles,
    imageUrl: string | null,
    gallery: ProductGalleryImageEntry[],
): ProductEntry => ({
    uuid: product.uuid,
    name: product.name,
    description: product.description,
    type: product.type,
    payment_method: product.payment_method,
    price: product.price,
    image_url: imageUrl,
    gallery,
    files: product.files.map(toProductFileEntry),
    created_at: product.created_at,
})

export const toStoreProductEntry = (entry: ProductEntry, purchased: boolean): StoreProductEntry => ({
    ...entry,
    purchased,
})

export const toOrderEntry = (order: OrderWithRelations): OrderEntry => ({
    uuid: order.uuid,
    status: order.status,
    payment_method: order.payment_method,
    total: order.total,
    product: {
        uuid: order.product.uuid,
        name: order.product.name,
        description: order.product.description,
        type: order.product.type,
    },
    files: order.status === OrderStatus.paid ? order.product.files.map(toProductFileEntry) : [],
    created_at: order.created_at,
    paid_at: order.paid_at,
})

export const toAdminOrderEntry = (order: OrderWithRelations): AdminOrderEntry => ({
    ...toOrderEntry(order),
    files: order.product.files.map(toProductFileEntry),
    user: order.user,
    cancelled_at: order.cancelled_at,
    stripe_payment_intent_id: order.stripe_payment_intent_id,
})

export const getStripePaymentIntentId = (session: Stripe.Checkout.Session): string | null =>
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null

export const buildCheckoutUrls = (appUrl: string, successPath: string, cancelPath: string, sessionPlaceholder: string) => ({
    success_url: `${appUrl}${successPath}?checkout=success&session_id=${sessionPlaceholder}`,
    cancel_url: `${appUrl}${cancelPath}?checkout=cancelled`,
})

export const summarizeOrderGroups = (groups: OrderGroupSummary[], totalProducts: number): StoreOverviewEntry => {
    const countByStatus = (status: OrderStatus): number =>
        groups.filter((group) => group.status === status).reduce((sum, group) => sum + group.count, 0)

    const paidRevenue = (method: PaymentMethod): number =>
        groups
            .filter((group) => group.status === OrderStatus.paid && group.payment_method === method)
            .reduce((sum, group) => sum + group.total, 0)

    return {
        total_products: totalProducts,
        total_orders: groups.reduce((sum, group) => sum + group.count, 0),
        paid_orders: countByStatus(OrderStatus.paid),
        pending_orders: countByStatus(OrderStatus.pending),
        cancelled_orders: countByStatus(OrderStatus.cancelled),
        points_revenue: paidRevenue(PaymentMethod.points),
        online_revenue: paidRevenue(PaymentMethod.online),
    }
}
