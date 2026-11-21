import { POINTS_LABEL } from '../constants/game'
import {
    PAYMENT_METHODS,
    PRODUCT_TYPES,
    STORE_CURRENCY_SYMBOL,
    STORE_MINOR_UNITS_PER_CURRENCY_UNIT,
    STORE_FILES_FIELD,
    STORE_IMAGE_FIELD,
    STORE_IMAGE_MIME_TYPES,
    STORE_MAX_IMAGE_SIZE_BYTES,
    STORE_MAX_FILE_SIZE_BYTES,
    STORE_MIN_ONLINE_PRICE_CENTS,
    SUPPORTED_PRODUCT_TYPES,
    type PaymentMethod,
    type ProductType,
    type SupportedProductType,
} from '../config/store/store.config'
import type { CreateProductPayload, ShippingAddress, UpdateProductPayload } from '../features/store/interfaces/store.interface'

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

export const formatPoints = (points: number): string => `${points.toLocaleString()} ${POINTS_LABEL}`

export const formatCents = (cents: number): string =>
    `${STORE_CURRENCY_SYMBOL}${(cents / STORE_MINOR_UNITS_PER_CURRENCY_UNIT).toFixed(2)}`

export const formatPrice = (paymentMethod: PaymentMethod, price: number): string =>
    paymentMethod === PAYMENT_METHODS.POINTS ? formatPoints(price) : formatCents(price)

export const formatFileSize = (bytes: number): string => {
    let value = bytes
    let unitIndex = 0

    while (value >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
        value /= 1024
        unitIndex += 1
    }

    return `${unitIndex === 0 ? value : value.toFixed(1)} ${BYTE_UNITS[unitIndex]}`
}

export const formatDateTime = (isoDate: string): string =>
    new Date(isoDate).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

export const getAvailablePoints = (stats: { points: number; points_spent?: number } | undefined): number =>
    Math.max(0, (stats?.points ?? 0) - (stats?.points_spent ?? 0))

export const centsToPoints = (cents: number, pointsPerCurrencyUnit: number): number =>
    Math.ceil((cents * pointsPerCurrencyUnit) / STORE_MINOR_UNITS_PER_CURRENCY_UNIT)

export const pointsToCents = (points: number, pointsPerCurrencyUnit: number): number =>
    Math.floor((points * STORE_MINOR_UNITS_PER_CURRENCY_UNIT) / pointsPerCurrencyUnit)

/**
 * Discount that `points` buy on a product. Mirrors the server: it may cover the whole price,
 * but a partial discount never leaves a charge under the online minimum.
 */
export const getDiscountForPoints = (points: number, pointsPerCurrencyUnit: number, priceCents: number): number => {
    const discountCents = Math.min(priceCents, pointsToCents(points, pointsPerCurrencyUnit))
    const remainingCents = priceCents - discountCents

    return remainingCents > 0 && remainingCents < STORE_MIN_ONLINE_PRICE_CENTS
        ? Math.max(0, priceCents - STORE_MIN_ONLINE_PRICE_CENTS)
        : discountCents
}

export const parsePriceInput = (input: string): number => {
    const parsed = Number(input)

    if (!Number.isFinite(parsed) || parsed <= 0) return 0

    return Math.round(parsed * STORE_MINOR_UNITS_PER_CURRENCY_UNIT)
}

export const formatPriceInput = (cents: number): string => (cents / STORE_MINOR_UNITS_PER_CURRENCY_UNIT).toFixed(2)

export const SHIPPING_COUNTRY_CODES = [
    'AL', 'AT', 'AU', 'BA', 'BE', 'BG', 'BR', 'CA', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB',
    'GE', 'GR', 'HR', 'HU', 'IE', 'IL', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MC', 'MD', 'ME', 'MK', 'MT', 'NL',
    'NO', 'NZ', 'PL', 'PT', 'RO', 'RS', 'SE', 'SI', 'SK', 'TR', 'UA', 'US', 'XK',
] as const

export const formatCountry = (code: string): string => {
    try {
        return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code
    } catch {
        return code
    }
}

export const EMPTY_SHIPPING_ADDRESS: ShippingAddress = {
    full_name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'GR',
}

const PHONE_PATTERN = /^\+?[0-9 ()-]{6,20}$/

export type ShippingFieldErrors = Partial<Record<keyof ShippingAddress, string>>

export const getShippingFieldErrors = (address: ShippingAddress): ShippingFieldErrors => {
    const errors: ShippingFieldErrors = {}

    if (address.full_name.trim().length === 0) errors.full_name = 'Enter the recipient full name'
    if (!PHONE_PATTERN.test(address.phone.trim())) errors.phone = 'Enter a valid phone number'
    if (address.line1.trim().length === 0) errors.line1 = 'Enter the street address'
    if (address.city.trim().length === 0) errors.city = 'Enter the city'
    if (address.postal_code.trim().length === 0) errors.postal_code = 'Enter the postal code'
    if (address.country.length !== 2) errors.country = 'Select a country'

    return errors
}

export const getShippingAddressError = (address: ShippingAddress): string | null =>
    Object.values(getShippingFieldErrors(address))[0] ?? null

export const isProductOwned = (product: { type: ProductType; purchased: boolean }): boolean =>
    product.purchased && product.type !== PRODUCT_TYPES.PHYSICAL

export const isSupportedProductType = (type: ProductType): type is SupportedProductType =>
    SUPPORTED_PRODUCT_TYPES.some((supported) => supported === type)

export const buildProductFormData = (payload: CreateProductPayload | UpdateProductPayload): FormData => {
    const formData = new FormData()

    formData.append('name', payload.name)
    formData.append('description', payload.description)
    formData.append('type', payload.type)
    formData.append('price', String(payload.price))
    formData.append('max_discount_percent', String(payload.max_discount_percent))
    formData.append('quantity', String(payload.quantity))
    formData.append('requires_verification', String(payload.requires_verification))
    payload.files.forEach((file) => formData.append(STORE_FILES_FIELD, file))
    payload.preview_new_indexes.forEach((index) => formData.append('preview_new_indexes', String(index)))

    if (payload.image) {
        formData.append(STORE_IMAGE_FIELD, payload.image)
    }

    if ('remove_file_uuids' in payload) {
        payload.remove_file_uuids.forEach((fileUuid) => formData.append('remove_file_uuids', fileUuid))
        payload.preview_file_uuids.forEach((fileUuid) => formData.append('preview_file_uuids', fileUuid))

        if (payload.remove_image) {
            formData.append('remove_image', 'true')
        }
    }

    return formData
}

export const getProductPayloadError = (
    payload: CreateProductPayload,
    keptFileCount = 0,
): string | null => {
    const totalFileCount = payload.files.length + keptFileCount

    if (payload.name.trim().length < 2) return 'Name must be at least 2 characters'

    if (payload.price < STORE_MIN_ONLINE_PRICE_CENTS) {
        return `Price must be at least ${formatCents(STORE_MIN_ONLINE_PRICE_CENTS)}`
    }

    if (!Number.isInteger(payload.max_discount_percent) || payload.max_discount_percent < 0 || payload.max_discount_percent > 100) {
        return 'Points discount must be a whole percentage from 0 to 100'
    }

    if (!Number.isInteger(payload.quantity) || payload.quantity < 1) return 'Quantity must be a whole number of at least 1'

    if (payload.type === PRODUCT_TYPES.DIGITAL && totalFileCount === 0) {
        return 'Add at least one file'
    }

    if (payload.image) {
        if (!STORE_IMAGE_MIME_TYPES.some((mimeType) => mimeType === payload.image?.type)) {
            return 'Cover image must be a JPEG, PNG, WebP or GIF'
        }

        if (payload.image.size > STORE_MAX_IMAGE_SIZE_BYTES) {
            return `Cover image is larger than ${formatFileSize(STORE_MAX_IMAGE_SIZE_BYTES)}`
        }
    }

    if (
        payload.type !== PRODUCT_TYPES.DIGITAL &&
        payload.files.some((file) => !STORE_IMAGE_MIME_TYPES.some((mimeType) => mimeType === file.type))
    ) {
        return 'Only digital products can have files other than images'
    }

    const oversizedFile = payload.files.find((file) => file.size > STORE_MAX_FILE_SIZE_BYTES)

    if (oversizedFile) {
        return `${oversizedFile.name} is larger than ${formatFileSize(STORE_MAX_FILE_SIZE_BYTES)}`
    }

    return null
}
