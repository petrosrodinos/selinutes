import { Trophy } from 'lucide-react'
import { StoreLayout } from '../../components/StoreLayout'
import { useMyStats } from '../../features/stats'
import { useCheckoutReturn, useStoreProducts } from '../../features/store'
import { formatPoints, getAvailablePoints, isSupportedProductType } from '../../utils/store.utils'
import { ProductCard } from './components/ProductCard'
import { useProductPurchase } from './hooks/useProductPurchase'

export const StorePage = () => {
    useCheckoutReturn()

    const { data: products, isLoading, isError } = useStoreProducts()
    const { data: stats } = useMyStats()
    const purchase = useProductPurchase()

    const availablePoints = getAvailablePoints(stats)
    const visibleProducts = (products ?? []).flatMap((product) =>
        isSupportedProductType(product.type) ? [{ product, productType: product.type }] : [],
    )

    const balance = (
        <div className="flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-800/70 px-4 py-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <div className="leading-tight">
                <p className="text-sm font-bold text-amber-400">{formatPoints(availablePoints)}</p>
                <p className="text-xs text-stone-400">Available to spend</p>
            </div>
        </div>
    )

    return (
        <StoreLayout title="Store" description="Spend your points or pay online to get digital products." actions={balance}>
            {isLoading ? (
                <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-6 text-stone-300">Loading products...</div>
            ) : null}

            {isError ? (
                <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-6 text-red-200">Failed to load products.</div>
            ) : null}

            {!isLoading && !isError && visibleProducts.length === 0 ? (
                <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-6 text-stone-400">
                    No products are available yet.
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProducts.map(({ product, productType }) => (
                    <ProductCard
                        key={product.uuid}
                        product={product}
                        productType={productType}
                        availablePoints={availablePoints}
                        isPurchasing={purchase.purchasingUuid === product.uuid}
                        onPurchase={purchase.handlePurchase}
                    />
                ))}
            </div>

        </StoreLayout>
    )
}
