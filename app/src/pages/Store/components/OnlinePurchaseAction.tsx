import { CreditCard, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCents, formatPoints } from '../../../utils/store.utils'
import type { PurchaseActionProps } from './store-card.types'

export const OnlinePurchaseAction = ({ product, isPurchasing, onPurchase, href }: PurchaseActionProps) => {
    const { points_used: pointsUsed, discount_cents: discountCents } = product.points_discount

    const handleClick = () => {
        onPurchase(product)
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gold" />
                <span className="text-xl font-bold text-gold">{formatCents(product.price)}</span>
            </div>
            {product.max_discount_percent > 0 ? (
                <p className="flex items-center gap-1.5 text-xs text-amber-400">
                    <Trophy className="h-3.5 w-3.5" />
                    {pointsUsed > 0
                        ? `Save ${formatCents(discountCents)} with ${formatPoints(pointsUsed)}`
                        : product.max_discount_percent === 100
                          ? 'Can be bought entirely with points'
                          : `Up to ${product.max_discount_percent}% can be paid with points`}
                </p>
            ) : null}
            {href ? (
                <Link
                    to={href}
                    className="block w-full cursor-pointer rounded-lg bg-gold px-4 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:bg-gold/90"
                >
                    Buy now
                </Link>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={isPurchasing}
                    className="w-full cursor-pointer rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isPurchasing ? 'Redirecting...' : 'Buy now'}
                </button>
            )}
        </div>
    )
}
