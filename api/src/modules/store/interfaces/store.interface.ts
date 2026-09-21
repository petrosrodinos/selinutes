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
    payment_method: PaymentMethod
    price: number
    image_url: string | null
    gallery: ProductGalleryImageEntry[]
    files: ProductFileEntry[]
    created_at: Date
}

export interface StoreProductEntry extends ProductEntry {
    purchased: boolean
}

export interface OrderProductEntry {
    uuid: string
    name: string
    description: string
    type: ProductType
}

export interface OrderEntry {
    uuid: string
    status: OrderStatus
    payment_method: PaymentMethod
    total: number
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

export interface FileDownloadResult {
    url: string
}

export interface OrderGroupSummary {
    status: OrderStatus
    payment_method: PaymentMethod
    count: number
    total: number
}
