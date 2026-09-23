export const PRODUCT_TYPES = {
    PHYSICAL: 'physical',
    DIGITAL: 'digital',
    IN_GAME_ASSET: 'in_game_asset',
} as const

export type ProductType = (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES]

export const SUPPORTED_PRODUCT_TYPES = [PRODUCT_TYPES.DIGITAL] as const

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

export const PAYMENT_METHOD_OPTIONS = [
    { value: PAYMENT_METHODS.POINTS, label: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.POINTS] },
    { value: PAYMENT_METHODS.ONLINE, label: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.ONLINE] },
] as const

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

export const STORE_ROUTES = {
    STORE: '/store',
    ORDERS: '/store/orders',
    PRODUCT: (productUuid: string) => `/store/${productUuid}`,
    CHECKOUT: (productUuid: string) => `/store/${productUuid}/checkout`,
    ADMIN_ORDERS: '/admin/store',
    ADMIN_PRODUCTS: '/admin/store/products',
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

export const STORE_CURRENCY_SYMBOL = '$'
export const STORE_MINOR_UNITS_PER_CURRENCY_UNIT = 100
export const STORE_MIN_ONLINE_PRICE_CENTS = 50
export const STORE_MAX_PRODUCT_FILES = 10
export const STORE_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
export const STORE_FILES_FIELD = 'files'
export const STORE_IMAGE_FIELD = 'image'
export const STORE_GALLERY_FIELD = 'gallery'
export const STORE_MAX_GALLERY_IMAGES = 8
export const STORE_MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const STORE_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
