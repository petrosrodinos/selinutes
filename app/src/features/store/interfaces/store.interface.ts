import type { OrderStatus, PaymentMethod, ProductType } from '../../../config/store/store.config'

export interface ProductFile {
    uuid: string
    name: string
    size: number
    content_type: string
}

export interface ProductGalleryImage {
    uuid: string
    url: string
}

export interface Product {
    uuid: string
    name: string
    description: string
    type: ProductType
    payment_method: PaymentMethod
    price: number
    image_url: string | null
    gallery: ProductGalleryImage[]
    files: ProductFile[]
    created_at: string
}

export interface StoreProduct extends Product {
    purchased: boolean
}

export interface OrderProduct {
    uuid: string
    name: string
    description: string
    type: ProductType
    image_url: string | null
}

export interface Order {
    uuid: string
    status: OrderStatus
    payment_method: PaymentMethod
    total: number
    product: OrderProduct
    files: ProductFile[]
    created_at: string
    paid_at: string | null
}

export interface AdminOrderUser {
    uuid: string
    username: string
    email: string
}

export interface AdminOrder extends Order {
    user: AdminOrderUser
    cancelled_at: string | null
    stripe_payment_intent_id: string | null
}

export interface StoreOverview {
    total_products: number
    total_orders: number
    paid_orders: number
    pending_orders: number
    cancelled_orders: number
    points_revenue: number
    online_revenue: number
}

export interface PurchaseResult {
    order: Order
    checkout_url: string | null
}

export interface FileDownloadResult {
    url: string
}

export interface CreateProductPayload {
    name: string
    description: string
    type: ProductType
    payment_method: PaymentMethod
    price: number
    image: File | null
    gallery: File[]
    files: File[]
}

export interface UpdateProductPayload extends CreateProductPayload {
    remove_file_uuids: string[]
    remove_gallery_uuids: string[]
    remove_image: boolean
}
