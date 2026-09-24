export const STORE_CURRENCY = 'eur'
export const STORE_CURRENCY_SYMBOL = '€'
export const STORE_POINTS_LABEL = 'SEL'
export const STORE_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
export const STORE_MIN_ONLINE_PRICE_CENTS = 50
export const STORE_MINOR_UNITS_PER_CURRENCY_UNIT = 100
export const STORE_DEFAULT_POINTS_PER_CURRENCY_UNIT = 100
export const STORE_MAX_POINTS_PER_CURRENCY_UNIT = 1_000_000
export const APP_CONFIG_ID = 1
export const STORE_DOWNLOAD_URL_EXPIRY_MINUTES = 10
export const STORE_GCS_FOLDER = 'store-products'
export const STORE_FILES_FIELD = 'files'

export const STORE_APP_ROUTES = {
    ORDERS: '/store/orders',
    STORE: '/store',
} as const

export const STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER = '{CHECKOUT_SESSION_ID}'

export const STRIPE_PAID_EVENT_TYPES = [
    'checkout.session.completed',
    'checkout.session.async_payment_succeeded',
] as const

export const STORE_IMAGE_FIELD = 'image'
export const STORE_MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const STORE_IMAGE_URL_EXPIRY_MINUTES = 60
export const STORE_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
