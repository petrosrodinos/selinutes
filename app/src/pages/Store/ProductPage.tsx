import { ArrowLeft, CreditCard, Package, Trophy, Zap } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StoreLayout } from '../../components/StoreLayout'
import { PRODUCT_TYPES, STORE_ROUTES } from '../../config/store/store.config'
import { useMyStats } from '../../features/stats'
import { useCheckoutReturn, useStoreProduct } from '../../features/store'
import { formatCents, formatPoints, getAvailablePoints } from '../../utils/store.utils'
import { OnlinePurchaseAction } from './components/OnlinePurchaseAction'
import { ProductGallery } from './components/ProductGallery'
import { useProductPurchase } from './hooks/useProductPurchase'

interface InfoTileProps {
    icon: ReactNode
    title: string
    text: string
}

const InfoTile = ({ icon, title, text }: InfoTileProps) => (
    <li className="flex items-start gap-3 rounded-2xl border border-stone-700 bg-stone-800/70 p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:border-amber-500/40">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">{icon}</span>
        <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-100">{title}</p>
            <p className="text-sm text-stone-400">{text}</p>
        </div>
    </li>
)

const BackToStoreLink = () => (
    <Link
        to={STORE_ROUTES.STORE}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-700 bg-stone-800/70 px-4 py-2 text-sm font-medium text-stone-200 transition-colors hover:bg-stone-700"
    >
        <ArrowLeft className="h-4 w-4" />
        Back to store
    </Link>
)

export const ProductPage = () => {
    useCheckoutReturn()

    const { productUuid } = useParams<{ productUuid: string }>()
    const { data: product, isLoading } = useStoreProduct(productUuid)
    const { data: stats } = useMyStats()
    const purchase = useProductPurchase()

    const availablePoints = getAvailablePoints(stats)

    if (!product) {
        return (
            <StoreLayout title="Product" description="Product preview" actions={<BackToStoreLink />}>
                {isLoading ? (
                    <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-6 text-stone-300">Loading product...</div>
                ) : (
                    <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-6 text-red-200">
                        This product could not be found.
                    </div>
                )}
            </StoreLayout>
        )
    }

    return (
        <StoreLayout title={product.name} actions={<BackToStoreLink />}>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
                <ProductGallery name={product.name} coverUrl={product.image_url} gallery={product.gallery} />

                <div className="space-y-6">
                    <div
                        className="inline-block -rotate-2 rounded-2xl bg-gradient-to-br from-gold to-amber-500 px-5 py-2 text-2xl font-black text-ink shadow-lg transition-transform duration-200 hover:rotate-0 hover:scale-105"
                    >
                        {formatCents(product.price)}
                    </div>

                    <p className="whitespace-pre-line text-base leading-relaxed text-stone-200">
                        {product.description || 'No description yet.'}
                    </p>

                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        {product.type === PRODUCT_TYPES.PHYSICAL ? (
                            <InfoTile
                                icon={<Zap className="h-5 w-5" />}
                                title="Instant delivery"
                                text="Unlocked in My Orders right after you buy."
                            />
                        ) : null}
                        <InfoTile
                            icon={<Package className="h-5 w-5" />}
                            title="Quantity"
                            text={`${product.quantity} available`}
                        />
                        <InfoTile icon={<CreditCard className="h-5 w-5" />} title="Payment" text="Online payment" />
                        {product.max_discount_percent > 0 ? (
                            <InfoTile
                                icon={<Trophy className="h-5 w-5" />}
                                title="Points discount"
                                text={
                                    product.max_discount_percent === 100
                                        ? 'Can be bought entirely with points'
                                        : `Pay up to ${product.max_discount_percent}% with points`
                                }
                            />
                        ) : null}
                    </ul>

                    <div className="rounded-2xl border border-stone-700 bg-stone-800/70 p-5">
                        {product.purchased ? (
                            <Link
                                to={STORE_ROUTES.ORDERS}
                                className="block cursor-pointer rounded-lg border border-gold/30 bg-gold/10 px-4 py-2.5 text-center text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
                            >
                                Owned · View in My Orders
                            </Link>
                        ) : (
                            <div className="space-y-3">
                                <OnlinePurchaseAction
                                    product={product}
                                    availablePoints={availablePoints}
                                    isPurchasing={purchase.purchasingUuid === product.uuid}
                                    onPurchase={purchase.handlePurchase}
                                />
                                {product.max_discount_percent > 0 ? (
                                    <p className="text-xs text-stone-500">You have {formatPoints(availablePoints)} available.</p>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </StoreLayout>
    )
}
