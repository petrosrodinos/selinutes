import Stripe from 'stripe'
import { PaymentMethod, ProductFile, ProductType, OrderStatus } from 'generated/prisma'
import {
    STORE_IMAGE_MIME_TYPES,
    STORE_CURRENCY_SYMBOL,
    STORE_MAX_IMAGE_SIZE_BYTES,
    STORE_MINOR_UNITS_PER_CURRENCY_UNIT,
    STORE_MIN_ONLINE_PRICE_CENTS,
    STORE_POINTS_LABEL,
} from '../constants/store.constants'
import { OrderWithRelations, ProductWithFiles } from '../constants/store-queries.constants'
import {
    AdminOrderEntry,
    OrderEntry,
    OrderGroupSummary,
    PointsDiscountEntry,
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

export const getProductPricingError = (price: number): string | null =>
    price < STORE_MIN_ONLINE_PRICE_CENTS ? `Price must be at least ${STORE_MIN_ONLINE_PRICE_CENTS} cents` : null

export const centsToPoints = (cents: number, pointsPerCurrencyUnit: number): number =>
    Math.ceil((cents * pointsPerCurrencyUnit) / STORE_MINOR_UNITS_PER_CURRENCY_UNIT)

export const pointsToCents = (points: number, pointsPerCurrencyUnit: number): number =>
    Math.floor((points * STORE_MINOR_UNITS_PER_CURRENCY_UNIT) / pointsPerCurrencyUnit)

/**
 * How many points a buyer can apply to a product, and the discount they are worth.
 * Limited by the product's max_discount_percent, the buyer's balance and, optionally, the
 * points the buyer chose to spend. The discount may cover the
 * whole price, but a partial discount can't leave a charge under the Stripe minimum, so it
 * is lowered to keep at least that much. Partial cents are rounded in the shop's favour.
 */
export const getPointsDiscount = (params: {
    priceCents: number
    maxDiscountPercent: number
    availablePoints: number
    requestedPoints?: number
    pointsPerCurrencyUnit: number
}): PointsDiscountEntry => {
    const { priceCents, maxDiscountPercent, availablePoints, requestedPoints, pointsPerCurrencyUnit } = params
    const spendablePoints = Math.max(0, Math.min(availablePoints, requestedPoints ?? availablePoints))
    const percentCapCents = Math.floor((priceCents * Math.min(100, Math.max(0, maxDiscountPercent))) / 100)
    let discountCents = Math.min(percentCapCents, pointsToCents(spendablePoints, pointsPerCurrencyUnit))
    const remainingCents = priceCents - discountCents

    if (remainingCents > 0 && remainingCents < STORE_MIN_ONLINE_PRICE_CENTS) {
        discountCents = Math.max(0, priceCents - STORE_MIN_ONLINE_PRICE_CENTS)
    }

    return discountCents > 0
        ? { points_used: centsToPoints(discountCents, pointsPerCurrencyUnit), discount_cents: discountCents }
        : { points_used: 0, discount_cents: 0 }
}

const formatCurrency = (cents: number): string =>
    `${STORE_CURRENCY_SYMBOL}${(cents / STORE_MINOR_UNITS_PER_CURRENCY_UNIT).toFixed(2)}`

/** The price line the buyer sees for an order, e.g. "€9.00 · 100 SEL used (−€1.00)". */
export const buildPaymentSummary = (totalCents: number, pointsUsed: number, discountCents: number): string =>
    pointsUsed > 0
        ? `${formatCurrency(totalCents)} · ${pointsUsed.toLocaleString('en-US')} ${STORE_POINTS_LABEL} used (−${formatCurrency(discountCents)})`
        : formatCurrency(totalCents)

export const isImageContentType = (contentType: string): boolean =>
    STORE_IMAGE_MIME_TYPES.some((mimeType) => mimeType === contentType)

export const getProductFilesError = (type: ProductType, contentTypes: string[]): string | null => {
    const fileCount = contentTypes.length

    if (type === ProductType.digital && fileCount === 0) {
        return 'Digital products require at least one file'
    }

    if (type !== ProductType.digital && !contentTypes.every(isImageContentType)) {
        return 'Only digital products can have files other than images'
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
    price: product.price,
    max_discount_percent: product.max_discount_percent,
    quantity: product.quantity,
    image_url: imageUrl,
    gallery,
    files: product.files.map(toProductFileEntry),
    created_at: product.created_at,
})

export const toStoreProductEntry = (
    entry: ProductEntry,
    purchased: boolean,
    pointsDiscount: PointsDiscountEntry,
    pointsPerCurrencyUnit: number,
): StoreProductEntry => ({
    ...entry,
    purchased,
    points_discount: pointsDiscount,
    points_per_currency_unit: pointsPerCurrencyUnit,
})

export const toOrderEntry = (order: OrderWithRelations, imageUrl: string | null = null): OrderEntry => ({
    uuid: order.uuid,
    status: order.status,
    payment_method: order.payment_method,
    total: order.total,
    points_used: order.points_used,
    discount_cents: order.discount_cents,
    payment_summary: order.payment_summary,
    price_cents: order.price_cents,
    points_per_currency_unit: order.points_per_currency_unit,
    product: {
        uuid: order.product.uuid,
        name: order.product.name,
        description: order.product.description,
        type: order.product.type,
        image_url: imageUrl,
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

    const paidGroups = groups.filter((group) => group.status === OrderStatus.paid)

    const paidRevenue = (method: PaymentMethod): number =>
        paidGroups.filter((group) => group.payment_method === method).reduce((sum, group) => sum + group.total, 0)

    const pointsRedeemed = paidGroups.reduce((sum, group) => sum + group.points_used, 0)

    return {
        total_products: totalProducts,
        total_orders: groups.reduce((sum, group) => sum + group.count, 0),
        paid_orders: countByStatus(OrderStatus.paid),
        pending_orders: countByStatus(OrderStatus.pending),
        cancelled_orders: countByStatus(OrderStatus.cancelled),
        points_revenue: paidRevenue(PaymentMethod.points) + pointsRedeemed,
        online_revenue: paidRevenue(PaymentMethod.online),
    }
}
