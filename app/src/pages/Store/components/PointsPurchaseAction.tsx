import { Trophy } from 'lucide-react'
import { formatPoints } from '../../../utils/store.utils'
import type { PurchaseActionProps } from './store-card.types'

export const PointsPurchaseAction = ({ product, availablePoints, isPurchasing, onPurchase }: PurchaseActionProps) => {
    const missingPoints = Math.max(0, product.price - availablePoints)
    const canAfford = missingPoints === 0

    const handleClick = () => {
        onPurchase(product)
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <span className="text-xl font-bold text-amber-400">{formatPoints(product.price)}</span>
            </div>
            <button
                type="button"
                onClick={handleClick}
                disabled={!canAfford || isPurchasing}
                className="w-full cursor-pointer rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-stone-900 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPurchasing ? 'Purchasing...' : 'Buy with points'}
            </button>
            {canAfford ? null : (
                <p className="text-xs text-stone-500">You need {formatPoints(missingPoints)} more</p>
            )}
        </div>
    )
}
