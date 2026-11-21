import { describe, expect, it } from 'vitest'
import { PRODUCT_TYPES } from '../../config/store/store.config'
import type { CreateProductPayload } from '../../features/store/interfaces/store.interface'
import {
    centsToPoints,
    formatCents,
    formatFileSize,
    getAvailablePoints,
    getDiscountForPoints,
    getProductPayloadError,
    EMPTY_SHIPPING_ADDRESS,
    getShippingAddressError,
    isProductOwned,
    isSupportedProductType,
    parsePriceInput,
} from '../store.utils'

const createPayload = (overrides: Partial<CreateProductPayload> = {}): CreateProductPayload => ({
    name: 'Playbook',
    description: '',
    type: PRODUCT_TYPES.DIGITAL,
    price: 500,
    max_discount_percent: 0,
    quantity: 1,
    requires_verification: false,
    image: null,
    files: [new File(['a'], 'a.pdf')],
    preview_new_indexes: [],
    ...overrides,
})

describe('getAvailablePoints', () => {
    it('subtracts spent points from earned points', () => {
        expect(getAvailablePoints({ points: 500, points_spent: 120 })).toBe(380)
    })

    it('never goes below zero and handles missing stats', () => {
        expect(getAvailablePoints({ points: 10, points_spent: 50 })).toBe(0)
        expect(getAvailablePoints(undefined)).toBe(0)
    })
})

describe('parsePriceInput', () => {
    it('converts EUR prices to cents', () => {
        expect(parsePriceInput('4.99')).toBe(499)
        expect(parsePriceInput('0.1')).toBe(10)
    })

    it('returns zero for invalid or non-positive input', () => {
        expect(parsePriceInput('')).toBe(0)
        expect(parsePriceInput('-3')).toBe(0)
        expect(parsePriceInput('abc')).toBe(0)
    })
})

describe('getDiscountForPoints', () => {
    it('can cover the whole price', () => {
        expect(getDiscountForPoints(900, 100, 900)).toBe(900)
        expect(getDiscountForPoints(5000, 100, 900)).toBe(900)
    })

    it('never leaves a partial charge under the online minimum', () => {
        expect(getDiscountForPoints(880, 100, 900)).toBe(850)
        expect(getDiscountForPoints(300, 100, 900)).toBe(300)
    })
})

describe('centsToPoints', () => {
    it('converts cents to points at the configured rate', () => {
        expect(centsToPoints(500, 100)).toBe(500)
        expect(centsToPoints(500, 250)).toBe(1250)
    })

    it('rounds partial points up', () => {
        expect(centsToPoints(199, 3)).toBe(6)
    })
})

describe('formatting', () => {
    it('formats cents as dollars', () => {
        expect(formatCents(499)).toBe('€4.99')
    })

    it('formats file sizes', () => {
        expect(formatFileSize(512)).toBe('512 B')
        expect(formatFileSize(1536)).toBe('1.5 KB')
        expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB')
    })
})

describe('isSupportedProductType', () => {
    it('supports digital and physical products in the UI', () => {
        expect(isSupportedProductType(PRODUCT_TYPES.DIGITAL)).toBe(true)
        expect(isSupportedProductType(PRODUCT_TYPES.PHYSICAL)).toBe(true)
        expect(isSupportedProductType(PRODUCT_TYPES.IN_GAME_ASSET)).toBe(false)
    })
})

describe('getProductPayloadError', () => {
    it('accepts a valid digital product', () => {
        expect(getProductPayloadError(createPayload())).toBeNull()
    })

    it('requires a file for digital products', () => {
        expect(getProductPayloadError(createPayload({ files: [] }))).not.toBeNull()
    })

    it('rejects prices under the minimum', () => {
        expect(getProductPayloadError(createPayload({ price: 10 }))).not.toBeNull()
    })

    it('accepts any number of files but rejects a missing price', () => {
        const many = Array.from({ length: 100 }, (_, index) => new File(['a'], `${index}.pdf`))

        expect(getProductPayloadError(createPayload({ files: many }))).toBeNull()
        expect(getProductPayloadError(createPayload({ price: 0 }))).not.toBeNull()
        expect(getProductPayloadError(createPayload({ max_discount_percent: 101 }))).not.toBeNull()
    })

    it('accepts a supported cover image and rejects other file types', () => {
        const png = new File(['x'], 'cover.png', { type: 'image/png' })
        const pdf = new File(['x'], 'cover.pdf', { type: 'application/pdf' })

        expect(getProductPayloadError(createPayload({ image: png }))).toBeNull()
        expect(getProductPayloadError(createPayload({ image: pdf }))).not.toBeNull()
    })
})

describe('getShippingAddressError', () => {
    const valid = { ...EMPTY_SHIPPING_ADDRESS, full_name: 'Maria P', phone: '+357 99 123456', line1: '12 Main St', city: 'Limassol', postal_code: '3025' }

    it('accepts a complete address', () => {
        expect(getShippingAddressError(valid)).toBeNull()
    })

    it('rejects missing required fields and bad phones', () => {
        expect(getShippingAddressError({ ...valid, full_name: ' ' })).not.toBeNull()
        expect(getShippingAddressError({ ...valid, phone: 'abc' })).not.toBeNull()
        expect(getShippingAddressError({ ...valid, line1: '' })).not.toBeNull()
        expect(getShippingAddressError({ ...valid, city: '' })).not.toBeNull()
        expect(getShippingAddressError({ ...valid, postal_code: '' })).not.toBeNull()
    })
})

describe('isProductOwned', () => {
    it('lets users buy physical products again', () => {
        expect(isProductOwned({ type: PRODUCT_TYPES.PHYSICAL, purchased: true })).toBe(false)
        expect(isProductOwned({ type: PRODUCT_TYPES.DIGITAL, purchased: true })).toBe(true)
    })
})
