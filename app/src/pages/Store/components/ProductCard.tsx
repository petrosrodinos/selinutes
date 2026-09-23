import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import {
    PAYMENT_METHODS,
    PRODUCT_TYPES,
    STORE_ROUTES,
    type PaymentMethod,
    type SupportedProductType,
} from '../../../config/store/store.config'
import type { StoreProduct } from '../../../features/store/interfaces/store.interface'
import { DigitalProductDetails } from './DigitalProductDetails'
import { OnlinePurchaseAction } from './OnlinePurchaseAction'
import { PointsPurchaseAction } from './PointsPurchaseAction'
import type { ProductDetailsProps, PurchaseActionProps } from './store-card.types'

const PRODUCT_DETAILS: Record<SupportedProductType, ComponentType<ProductDetailsProps>> = {
    [PRODUCT_TYPES.DIGITAL]: DigitalProductDetails,
}

const PURCHASE_ACTIONS: Record<PaymentMethod, ComponentType<PurchaseActionProps>> = {
    [PAYMENT_METHODS.POINTS]: PointsPurchaseAction,
    [PAYMENT_METHODS.ONLINE]: OnlinePurchaseAction,
}

interface ProductCardProps {
    product: StoreProduct
    productType: SupportedProductType
    availablePoints: number
    isPurchasing: boolean
    onPurchase: (product: StoreProduct) => void
}

export const ProductCard = ({ product, productType, availablePoints, isPurchasing, onPurchase }: ProductCardProps) => {
    const Details = PRODUCT_DETAILS[productType]
    const PurchaseAction = PURCHASE_ACTIONS[product.payment_method]

    return (
        <article className="group relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-xl border border-stone-700 bg-stone-800/70 pb-5 transition-colors hover:border-amber-500/40">
            {product.image_url ? (
                <div className="overflow-hidden">
                    <img
                        src={product.image_url}
                        alt=""
                        loading="lazy"
                        className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            ) : null}
            <h2 className="px-5 text-lg font-semibold text-amber-300">
                <Link
                    to={STORE_ROUTES.PRODUCT(product.uuid)}
                    className="transition-colors after:absolute after:inset-0 group-hover:text-amber-200"
                >
                    {product.name}
                </Link>
            </h2>
            <div className="flex-1 px-5">
                <Details product={product} />
            </div>
            <div className="relative z-10 mx-5 cursor-default border-t border-stone-700/60 pt-4">
                {product.purchased ? (
                    <Link
                        to={STORE_ROUTES.ORDERS}
                        className="block cursor-pointer rounded-lg border border-gold/30 bg-gold/10 px-4 py-2.5 text-center text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
                    >
                        Owned · View in My Orders
                    </Link>
                ) : (
                    <PurchaseAction
                        product={product}
                        availablePoints={availablePoints}
                        isPurchasing={isPurchasing}
                        onPurchase={onPurchase}
                    />
                )}
            </div>
        </article>
    )
}
