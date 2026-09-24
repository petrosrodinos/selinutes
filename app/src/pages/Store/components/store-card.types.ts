import type { StoreProduct } from '../../../features/store/interfaces/store.interface'

export interface ProductDetailsProps {
    product: StoreProduct
}

export interface PurchaseActionProps {
    product: StoreProduct
    availablePoints: number
    isPurchasing: boolean
    onPurchase: (product: StoreProduct) => void
    /** When set, the "Buy now" button links here instead of starting the purchase. */
    href?: string
}
