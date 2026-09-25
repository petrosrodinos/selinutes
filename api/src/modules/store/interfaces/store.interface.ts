import { Readable } from 'stream'
import { OrderStatus, PaymentMethod, ProductType } from 'generated/prisma'

export interface ProductFileEntry {
    uuid: string
    name: string
    size: number
    content_type: string
}

export interface ProductGalleryImageEntry {
    uuid: string
    url: string
}

export interface ProductEntry {
    uuid: string
    name: string
    description: string
    type: ProductType
    price: number
    max_discount_percent: number
    quantity: number
    image_url: string | null
    gallery: ProductGalleryImageEntry[]
    files: ProductFileEntry[]
    created_at: Date
}

export interface AppConfigEntry {
    points_per_currency_unit: number
}

export interface PointsDiscountEntry {
    points_used: number
    discount_cents: number
}

export interface StoreProductEntry extends ProductEntry {
    purchased: boolean
    points_discount: PointsDiscountEntry
    points_per_currency_unit: number
}

export interface OrderProductEntry {
    uuid: string
    name: string
    description: string
    type: ProductType
    image_url: string | null
}

export interface OrderEntry {
    uuid: string
    status: OrderStatus
    payment_method: PaymentMethod
    total: number
    points_used: number
    discount_cents: number
    payment_summary: string | null
    price_cents: number | null
    points_per_currency_unit: number | null
    product: OrderProductEntry
    files: ProductFileEntry[]
    created_at: Date
    paid_at: Date | null
}

export interface AdminOrderUserEntry {
    uuid: string
    username: string
    email: string
}

export interface AdminOrderEntry extends OrderEntry {
    user: AdminOrderUserEntry
    cancelled_at: Date | null
    stripe_payment_intent_id: string | null
    stripe_fee_cents: number | null
}

export interface StoreOverviewEntry {
    total_products: number
    total_orders: number
    paid_orders: number
    pending_orders: number
    cancelled_orders: number
    points_revenue: number
    online_revenue: number
}

export interface PurchaseResult {
    order: OrderEntry
    checkout_url: string | null
}

export interface OrderArchiveResult {
    stream: Readable
    filename: string
}

export interface FileDownloadResult {
    url: string
}

export interface OrderGroupSummary {
    status: OrderStatus
    payment_method: PaymentMethod
    count: number
    total: number
    points_used: number
}
