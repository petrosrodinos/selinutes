import { CreditCard } from 'lucide-react'
import { formatCents } from '../../../utils/store.utils'
import type { PurchaseActionProps } from './store-card.types'

export const OnlinePurchaseAction = ({ product, isPurchasing, onPurchase }: PurchaseActionProps) => {
    const handleClick = () => {
        onPurchase(product)
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gold" />
                <span className="text-xl font-bold text-gold">{formatCents(product.price)}</span>
            </div>
            <button
                type="button"
                onClick={handleClick}
                disabled={isPurchasing}
                className="w-full cursor-pointer rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPurchasing ? 'Redirecting...' : 'Pay online'}
            </button>
        </div>
    )
}
