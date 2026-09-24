import { OrderStatus, PaymentMethod, ProductType } from 'generated/prisma'
import { OrderWithRelations } from '../constants/store-queries.constants'
import { STORE_MIN_ONLINE_PRICE_CENTS } from '../constants/store.constants'
import {
    buildPaymentSummary,
    centsToPoints,
    getPointsDiscount,
    getProductFilesError,
    getProductPricingError,
    sanitizeFileName,
    summarizeOrderGroups,
    toAdminOrderEntry,
    toOrderEntry,
} from './store.helper'

const createOrder = (status: OrderStatus): OrderWithRelations => ({
    id: 1,
    uuid: 'order-uuid',
    user_uuid: 'user-uuid',
    product_uuid: 'product-uuid',
    status,
    payment_method: PaymentMethod.points,
    total: 100,
    points_used: 0,
    discount_cents: 0,
    price_cents: 100,
    points_per_currency_unit: 100,
    payment_summary: '€1.00',
    stripe_session_id: null,
    stripe_payment_intent_id: null,
    paid_at: null,
    cancelled_at: null,
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
    user: { uuid: 'user-uuid', username: 'player', email: 'player@example.com' },
    product: {
        id: 1,
        uuid: 'product-uuid',
        name: 'Playbook',
        description: 'Guide',
        type: ProductType.digital,
        price: 100,
        max_discount_percent: 0,
        quantity: 1,
        image_path: null,
        created_at: new Date('2026-01-01T00:00:00Z'),
        updated_at: new Date('2026-01-01T00:00:00Z'),
        files: [
            {
                id: 1,
                uuid: 'file-uuid',
                product_uuid: 'product-uuid',
                name: 'guide.pdf',
                path: 'store-products/product-uuid/1-guide.pdf',
                size: 2048,
                content_type: 'application/pdf',
                created_at: new Date('2026-01-01T00:00:00Z'),
            },
        ],
    },
})

describe('sanitizeFileName', () => {
    it('replaces path separators and unsafe characters', () => {
        expect(sanitizeFileName('../evil/na<me>.pdf')).toBe('.._evil_na_me_.pdf')
    })

    it('falls back to a default name when nothing is left', () => {
        expect(sanitizeFileName('   ')).toBe('file')
    })
})

describe('getProductPricingError', () => {
    it('rejects prices under the Stripe minimum', () => {
        expect(getProductPricingError(STORE_MIN_ONLINE_PRICE_CENTS - 1)).not.toBeNull()
    })

    it('accepts the minimum price and above', () => {
        expect(getProductPricingError(STORE_MIN_ONLINE_PRICE_CENTS)).toBeNull()
        expect(getProductPricingError(1000)).toBeNull()
    })
})

describe('centsToPoints', () => {
    it('converts cents to points at the configured rate', () => {
        expect(centsToPoints(500, 100)).toBe(500)
        expect(centsToPoints(500, 250)).toBe(1250)
    })

    it('rounds partial points up so a product never costs less than its price', () => {
        expect(centsToPoints(199, 3)).toBe(6)
    })
})

describe('buildPaymentSummary', () => {
    it('shows the paid amount and the points used', () => {
        expect(buildPaymentSummary(900, 100, 100)).toBe('€9.00 · 100 SEL used (−€1.00)')
    })

    it('shows only the amount when no points were used', () => {
        expect(buildPaymentSummary(1000, 0, 0)).toBe('€10.00')
    })
})

describe('getPointsDiscount', () => {
    const base = { priceCents: 1000, maxDiscountPercent: 30, availablePoints: 5000, pointsPerCurrencyUnit: 100 }

    it('applies at most the product max discount percent', () => {
        expect(getPointsDiscount(base)).toEqual({ points_used: 300, discount_cents: 300 })
    })

    it('is limited by the buyer balance', () => {
        expect(getPointsDiscount({ ...base, availablePoints: 120 })).toEqual({ points_used: 120, discount_cents: 120 })
    })

    it('is limited by the points the buyer chose to spend', () => {
        expect(getPointsDiscount({ ...base, requestedPoints: 50 })).toEqual({ points_used: 50, discount_cents: 50 })
    })

    it('can cover the whole price at 100%, so the product is bought with points only', () => {
        expect(getPointsDiscount({ ...base, maxDiscountPercent: 100 })).toEqual({ points_used: 1000, discount_cents: 1000 })
        expect(getPointsDiscount({ ...base, priceCents: STORE_MIN_ONLINE_PRICE_CENTS, maxDiscountPercent: 100 })).toEqual({
            points_used: STORE_MIN_ONLINE_PRICE_CENTS,
            discount_cents: STORE_MIN_ONLINE_PRICE_CENTS,
        })
    })

    it('never leaves a partial charge under the Stripe minimum', () => {
        expect(getPointsDiscount({ ...base, maxDiscountPercent: 100, requestedPoints: 980 })).toEqual({
            points_used: 1000 - STORE_MIN_ONLINE_PRICE_CENTS,
            discount_cents: 1000 - STORE_MIN_ONLINE_PRICE_CENTS,
        })
    })

    it('gives no discount when points are disabled or unaffordable', () => {
        expect(getPointsDiscount({ ...base, maxDiscountPercent: 0 })).toEqual({ points_used: 0, discount_cents: 0 })
        expect(getPointsDiscount({ ...base, maxDiscountPercent: 100, availablePoints: 0 })).toEqual({
            points_used: 0,
            discount_cents: 0,
        })
    })

    it('converts points at the configured rate without overcharging points', () => {
        expect(getPointsDiscount({ ...base, maxDiscountPercent: 40, pointsPerCurrencyUnit: 250 })).toEqual({
            points_used: 1000,
            discount_cents: 400,
        })
    })
})

describe('getProductFilesError', () => {
    it('requires at least one file for digital products', () => {
        expect(getProductFilesError(ProductType.digital, [])).not.toBeNull()
        expect(getProductFilesError(ProductType.digital, ['application/pdf', 'image/png', 'image/png'])).toBeNull()
    })

    it('only allows image files on non-digital products', () => {
        expect(getProductFilesError(ProductType.physical, ['application/pdf'])).not.toBeNull()
        expect(getProductFilesError(ProductType.in_game_asset, ['image/png', 'application/zip'])).not.toBeNull()
        expect(getProductFilesError(ProductType.physical, ['image/png'])).toBeNull()
        expect(getProductFilesError(ProductType.physical, [])).toBeNull()
    })

    it('does not limit the number of files', () => {
        expect(getProductFilesError(ProductType.digital, Array(500).fill('application/pdf'))).toBeNull()
    })
})

describe('summarizeOrderGroups', () => {
    it('counts orders by status and sums revenue for paid orders only', () => {
        const summary = summarizeOrderGroups(
            [
                { status: OrderStatus.paid, payment_method: PaymentMethod.points, count: 2, total: 300, points_used: 0 },
                { status: OrderStatus.paid, payment_method: PaymentMethod.online, count: 1, total: 999, points_used: 150 },
                { status: OrderStatus.pending, payment_method: PaymentMethod.online, count: 4, total: 4000, points_used: 0 },
                { status: OrderStatus.cancelled, payment_method: PaymentMethod.points, count: 1, total: 50, points_used: 0 },
            ],
            5,
        )

        expect(summary).toEqual({
            total_products: 5,
            total_orders: 8,
            paid_orders: 3,
            pending_orders: 4,
            cancelled_orders: 1,
            points_revenue: 450,
            online_revenue: 999,
        })
    })

    it('returns zeros when there are no orders', () => {
        expect(summarizeOrderGroups([], 0).total_orders).toBe(0)
    })
})

describe('order mapping', () => {
    it('exposes files to the buyer only when the order is paid', () => {
        expect(toOrderEntry(createOrder(OrderStatus.paid)).files).toHaveLength(1)
        expect(toOrderEntry(createOrder(OrderStatus.pending)).files).toHaveLength(0)
        expect(toOrderEntry(createOrder(OrderStatus.cancelled)).files).toHaveLength(0)
    })

    it('never exposes storage paths', () => {
        const serialized = JSON.stringify(toAdminOrderEntry(createOrder(OrderStatus.paid)))

        expect(serialized).not.toContain('store-products/')
    })

    it('always lists files for admins', () => {
        expect(toAdminOrderEntry(createOrder(OrderStatus.cancelled)).files).toHaveLength(1)
    })
})
