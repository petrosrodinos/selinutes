import { POINTS_LABEL } from '../constants/game'
import {
    PAYMENT_METHODS,
    PRODUCT_TYPES,
    STORE_CURRENCY_SYMBOL,
    STORE_MINOR_UNITS_PER_CURRENCY_UNIT,
    STORE_FILES_FIELD,
    STORE_GALLERY_FIELD,
    STORE_IMAGE_FIELD,
    STORE_IMAGE_MIME_TYPES,
    STORE_MAX_GALLERY_IMAGES,
    STORE_MAX_IMAGE_SIZE_BYTES,
    STORE_MAX_FILE_SIZE_BYTES,
    STORE_MAX_PRODUCT_FILES,
    STORE_MIN_ONLINE_PRICE_CENTS,
    SUPPORTED_PRODUCT_TYPES,
    type PaymentMethod,
    type ProductType,
    type SupportedProductType,
} from '../config/store/store.config'
import type { CreateProductPayload, UpdateProductPayload } from '../features/store/interfaces/store.interface'

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

export const parsePriceInput = (paymentMethod: PaymentMethod, input: string): number => {
    const parsed = Number(input)

    if (!Number.isFinite(parsed) || parsed <= 0) return 0

    return paymentMethod === PAYMENT_METHODS.POINTS
        ? Math.floor(parsed)
        : Math.round(parsed * STORE_MINOR_UNITS_PER_CURRENCY_UNIT)
}

export const formatPriceInput = (paymentMethod: PaymentMethod, price: number): string =>
    paymentMethod === PAYMENT_METHODS.POINTS
        ? String(price)
        : (price / STORE_MINOR_UNITS_PER_CURRENCY_UNIT).toFixed(2)

export const isSupportedProductType = (type: ProductType): type is SupportedProductType =>
    SUPPORTED_PRODUCT_TYPES.some((supported) => supported === type)

export const buildProductFormData = (payload: CreateProductPayload | UpdateProductPayload): FormData => {
    const formData = new FormData()

    formData.append('name', payload.name)
    formData.append('description', payload.description)
    formData.append('type', payload.type)
    formData.append('payment_method', payload.payment_method)
    formData.append('price', String(payload.price))
    payload.files.forEach((file) => formData.append(STORE_FILES_FIELD, file))
    payload.gallery.forEach((image) => formData.append(STORE_GALLERY_FIELD, image))

    if (payload.image) {
        formData.append(STORE_IMAGE_FIELD, payload.image)
    }

    if ('remove_file_uuids' in payload) {
        payload.remove_file_uuids.forEach((fileUuid) => formData.append('remove_file_uuids', fileUuid))
        payload.remove_gallery_uuids.forEach((imageUuid) => formData.append('remove_gallery_uuids', imageUuid))

        if (payload.remove_image) {
            formData.append('remove_image', 'true')
        }
    }

    return formData
}

export const getProductPayloadError = (
    payload: CreateProductPayload,
    keptFileCount = 0,
    keptGalleryCount = 0,
): string | null => {
    const totalFileCount = payload.files.length + keptFileCount
    const totalGalleryCount = payload.gallery.length + keptGalleryCount

    if (payload.name.trim().length < 2) return 'Name must be at least 2 characters'

    if (payload.price <= 0) return 'Enter a price greater than zero'

    if (payload.payment_method === PAYMENT_METHODS.ONLINE && payload.price < STORE_MIN_ONLINE_PRICE_CENTS) {
        return `Online price must be at least ${formatCents(STORE_MIN_ONLINE_PRICE_CENTS)}`
    }

    if (payload.type === PRODUCT_TYPES.DIGITAL && totalFileCount === 0) {
        return 'Add at least one file'
    }

    if (totalFileCount > STORE_MAX_PRODUCT_FILES) {
        return `A product can have at most ${STORE_MAX_PRODUCT_FILES} files`
    }

    if (payload.image) {
        if (!STORE_IMAGE_MIME_TYPES.some((mimeType) => mimeType === payload.image?.type)) {
            return 'Cover image must be a JPEG, PNG, WebP or GIF'
        }

        if (payload.image.size > STORE_MAX_IMAGE_SIZE_BYTES) {
            return `Cover image is larger than ${formatFileSize(STORE_MAX_IMAGE_SIZE_BYTES)}`
        }
    }

    if (totalGalleryCount > STORE_MAX_GALLERY_IMAGES) {
        return `A product can have at most ${STORE_MAX_GALLERY_IMAGES} gallery images`
    }

    const invalidGalleryImage = payload.gallery.find(
        (image) => !STORE_IMAGE_MIME_TYPES.some((mimeType) => mimeType === image.type),
    )

    if (invalidGalleryImage) {
        return `${invalidGalleryImage.name} must be a JPEG, PNG, WebP or GIF`
    }

    const oversizedGalleryImage = payload.gallery.find((image) => image.size > STORE_MAX_IMAGE_SIZE_BYTES)

    if (oversizedGalleryImage) {
        return `${oversizedGalleryImage.name} is larger than ${formatFileSize(STORE_MAX_IMAGE_SIZE_BYTES)}`
    }

    const oversizedFile = payload.files.find((file) => file.size > STORE_MAX_FILE_SIZE_BYTES)

    if (oversizedFile) {
        return `${oversizedFile.name} is larger than ${formatFileSize(STORE_MAX_FILE_SIZE_BYTES)}`
    }

    return null
}
