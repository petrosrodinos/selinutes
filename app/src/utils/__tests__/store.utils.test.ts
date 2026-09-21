import { describe, expect, it } from 'vitest'
import { PAYMENT_METHODS, PRODUCT_TYPES, STORE_MAX_PRODUCT_FILES } from '../../config/store/store.config'
import type { CreateProductPayload } from '../../features/store/interfaces/store.interface'
import {
    formatCents,
    formatFileSize,
    getAvailablePoints,
    getProductPayloadError,
    isSupportedProductType,
    parsePriceInput,
} from '../store.utils'

const createPayload = (overrides: Partial<CreateProductPayload> = {}): CreateProductPayload => ({
    name: 'Playbook',
    description: '',
    type: PRODUCT_TYPES.DIGITAL,
    payment_method: PAYMENT_METHODS.POINTS,
    price: 100,
    image: null,
    gallery: [],
    files: [new File(['a'], 'a.pdf')],
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
    it('floors points to whole numbers', () => {
        expect(parsePriceInput(PAYMENT_METHODS.POINTS, '12.9')).toBe(12)
    })

    it('converts online prices to cents', () => {
        expect(parsePriceInput(PAYMENT_METHODS.ONLINE, '4.99')).toBe(499)
        expect(parsePriceInput(PAYMENT_METHODS.ONLINE, '0.1')).toBe(10)
    })

    it('returns zero for invalid or non-positive input', () => {
        expect(parsePriceInput(PAYMENT_METHODS.POINTS, '')).toBe(0)
        expect(parsePriceInput(PAYMENT_METHODS.ONLINE, '-3')).toBe(0)
        expect(parsePriceInput(PAYMENT_METHODS.ONLINE, 'abc')).toBe(0)
    })
})

describe('formatting', () => {
    it('formats cents as dollars', () => {
        expect(formatCents(499)).toBe('$4.99')
    })

    it('formats file sizes', () => {
        expect(formatFileSize(512)).toBe('512 B')
        expect(formatFileSize(1536)).toBe('1.5 KB')
        expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB')
    })
})

describe('isSupportedProductType', () => {
    it('supports only digital products in the UI', () => {
        expect(isSupportedProductType(PRODUCT_TYPES.DIGITAL)).toBe(true)
        expect(isSupportedProductType(PRODUCT_TYPES.PHYSICAL)).toBe(false)
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

    it('rejects online prices under the minimum', () => {
        expect(getProductPayloadError(createPayload({ payment_method: PAYMENT_METHODS.ONLINE, price: 10 }))).not.toBeNull()
    })

    it('rejects too many files and missing price', () => {
        const tooMany = Array.from({ length: STORE_MAX_PRODUCT_FILES + 1 }, (_, index) => new File(['a'], `${index}.pdf`))

        expect(getProductPayloadError(createPayload({ files: tooMany }))).not.toBeNull()
        expect(getProductPayloadError(createPayload({ price: 0 }))).not.toBeNull()
    })

    it('accepts a supported cover image and rejects other file types', () => {
        const png = new File(['x'], 'cover.png', { type: 'image/png' })
        const pdf = new File(['x'], 'cover.pdf', { type: 'application/pdf' })

        expect(getProductPayloadError(createPayload({ image: png }))).toBeNull()
        expect(getProductPayloadError(createPayload({ image: pdf }))).not.toBeNull()
    })
})
