import { OrderStatus, PaymentMethod, ProductType } from 'generated/prisma'
import { OrderWithRelations } from '../constants/store-queries.constants'
import { STORE_MAX_PRODUCT_FILES, STORE_MIN_ONLINE_PRICE_CENTS } from '../constants/store.constants'
import {
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
        payment_method: PaymentMethod.points,
        price: 100,
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
        images: [],
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
    it('rejects online prices under the Stripe minimum', () => {
        expect(getProductPricingError(PaymentMethod.online, STORE_MIN_ONLINE_PRICE_CENTS - 1)).not.toBeNull()
    })

    it('accepts the minimum online price and any points price', () => {
        expect(getProductPricingError(PaymentMethod.online, STORE_MIN_ONLINE_PRICE_CENTS)).toBeNull()
        expect(getProductPricingError(PaymentMethod.points, 1)).toBeNull()
    })
})

describe('getProductFilesError', () => {
    it('requires at least one file for digital products', () => {
        expect(getProductFilesError(ProductType.digital, 0)).not.toBeNull()
        expect(getProductFilesError(ProductType.digital, 3)).toBeNull()
    })

    it('rejects files on non-digital products', () => {
        expect(getProductFilesError(ProductType.physical, 1)).not.toBeNull()
        expect(getProductFilesError(ProductType.in_game_asset, 1)).not.toBeNull()
        expect(getProductFilesError(ProductType.physical, 0)).toBeNull()
    })

    it('rejects more files than the limit', () => {
        expect(getProductFilesError(ProductType.digital, STORE_MAX_PRODUCT_FILES + 1)).not.toBeNull()
    })
})

describe('summarizeOrderGroups', () => {
    it('counts orders by status and sums revenue for paid orders only', () => {
        const summary = summarizeOrderGroups(
            [
                { status: OrderStatus.paid, payment_method: PaymentMethod.points, count: 2, total: 300 },
                { status: OrderStatus.paid, payment_method: PaymentMethod.online, count: 1, total: 999 },
                { status: OrderStatus.pending, payment_method: PaymentMethod.online, count: 4, total: 4000 },
                { status: OrderStatus.cancelled, payment_method: PaymentMethod.points, count: 1, total: 50 },
            ],
            5,
        )

        expect(summary).toEqual({
            total_products: 5,
            total_orders: 8,
            paid_orders: 3,
            pending_orders: 4,
            cancelled_orders: 1,
            points_revenue: 300,
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
