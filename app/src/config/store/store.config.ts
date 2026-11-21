export const PRODUCT_TYPES = {
    PHYSICAL: 'physical',
    DIGITAL: 'digital',
    IN_GAME_ASSET: 'in_game_asset',
} as const

export type ProductType = (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES]

export const SUPPORTED_PRODUCT_TYPES = [PRODUCT_TYPES.DIGITAL, PRODUCT_TYPES.PHYSICAL] as const

export type SupportedProductType = (typeof SUPPORTED_PRODUCT_TYPES)[number]

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
    [PRODUCT_TYPES.PHYSICAL]: 'Physical product',
    [PRODUCT_TYPES.DIGITAL]: 'Digital product',
    [PRODUCT_TYPES.IN_GAME_ASSET]: 'In-game asset',
}

export const PRODUCT_TYPE_OPTIONS = SUPPORTED_PRODUCT_TYPES.map((value) => ({
    value,
    label: PRODUCT_TYPE_LABELS[value],
}))

export const PAYMENT_METHODS = {
    POINTS: 'points',
    ONLINE: 'online',
} as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    [PAYMENT_METHODS.POINTS]: 'In-game points',
    [PAYMENT_METHODS.ONLINE]: 'Online payment',
}

export const ORDER_STATUSES = {
    PENDING: 'pending',
    PAID: 'paid',
    CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    [ORDER_STATUSES.PENDING]: 'Pending',
    [ORDER_STATUSES.PAID]: 'Paid',
    [ORDER_STATUSES.CANCELLED]: 'Cancelled',
}

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
    [ORDER_STATUSES.PENDING]: 'bg-amber-500/15 text-amber-300',
    [ORDER_STATUSES.PAID]: 'bg-emerald-500/15 text-emerald-300',
    [ORDER_STATUSES.CANCELLED]: 'bg-rose-500/15 text-rose-300',
}

export const FULFILLMENT_STATUSES = {
    PENDING_VERIFICATION: 'pending_verification',
    VERIFIED: 'verified',
    PREPARING: 'preparing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
} as const

export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[keyof typeof FULFILLMENT_STATUSES]

export const FULFILLMENT_STATUS_ORDER: readonly FulfillmentStatus[] = [
    FULFILLMENT_STATUSES.PENDING_VERIFICATION,
    FULFILLMENT_STATUSES.VERIFIED,
    FULFILLMENT_STATUSES.PREPARING,
    FULFILLMENT_STATUSES.SHIPPED,
    FULFILLMENT_STATUSES.DELIVERED,
]

export const FULFILLMENT_STATUS_LABELS: Record<FulfillmentStatus, string> = {
    [FULFILLMENT_STATUSES.PENDING_VERIFICATION]: 'Pending verification',
    [FULFILLMENT_STATUSES.VERIFIED]: 'Verified',
    [FULFILLMENT_STATUSES.PREPARING]: 'Preparing for shipping',
    [FULFILLMENT_STATUSES.SHIPPED]: 'Shipped',
    [FULFILLMENT_STATUSES.DELIVERED]: 'Delivered',
}

export const FULFILLMENT_STATUS_HINTS: Record<FulfillmentStatus, string> = {
    [FULFILLMENT_STATUSES.PENDING_VERIFICATION]: 'We are reviewing your order. We will verify it shortly.',
    [FULFILLMENT_STATUSES.VERIFIED]: 'We received and verified your order.',
    [FULFILLMENT_STATUSES.PREPARING]: 'We are packing your order.',
    [FULFILLMENT_STATUSES.SHIPPED]: 'Your order is on its way.',
    [FULFILLMENT_STATUSES.DELIVERED]: 'Your order has been delivered.',
}

export const FULFILLMENT_STATUS_STYLES: Record<FulfillmentStatus, string> = {
    [FULFILLMENT_STATUSES.PENDING_VERIFICATION]: 'bg-stone-500/20 text-stone-300',
    [FULFILLMENT_STATUSES.VERIFIED]: 'bg-sky-500/15 text-sky-300',
    [FULFILLMENT_STATUSES.PREPARING]: 'bg-amber-500/15 text-amber-300',
    [FULFILLMENT_STATUSES.SHIPPED]: 'bg-violet-500/15 text-violet-300',
    [FULFILLMENT_STATUSES.DELIVERED]: 'bg-emerald-500/15 text-emerald-300',
}

export const STORE_ROUTES = {
    STORE: '/store',
    ORDERS: '/store/orders',
    PRODUCT: (productUuid: string) => `/store/${productUuid}`,
    CHECKOUT: (productUuid: string) => `/store/${productUuid}/checkout`,
    ADMIN_ORDERS: '/admin/store',
    ADMIN_PRODUCTS: '/admin/store/products',
    ADMIN_PRODUCT_NEW: '/admin/store/products/new',
    ADMIN_PRODUCT: (productUuid: string) => `/admin/store/products/${productUuid}`,
} as const

export const STORE_ADMIN_TABS = [
    { to: STORE_ROUTES.ADMIN_ORDERS, label: 'Overview & Orders', end: true },
    { to: STORE_ROUTES.ADMIN_PRODUCTS, label: 'Products', end: false },
] as const

export const CHECKOUT_QUERY = {
    STATUS_PARAM: 'checkout',
    SESSION_PARAM: 'session_id',
    SUCCESS: 'success',
    CANCELLED: 'cancelled',
} as const

export const STORE_CURRENCY_SYMBOL = '€'
export const STORE_MINOR_UNITS_PER_CURRENCY_UNIT = 100
export const STORE_MIN_ONLINE_PRICE_CENTS = 50
export const STORE_MAX_POINTS_PER_CURRENCY_UNIT = 1_000_000
export const STORE_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
export const STORE_FILES_FIELD = 'files'
export const STORE_IMAGE_FIELD = 'image'
export const STORE_MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const STORE_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
