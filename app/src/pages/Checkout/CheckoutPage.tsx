import { useState, type ChangeEvent } from 'react'
import { CreditCard, Trophy } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { StoreLayout } from '../../components/StoreLayout'
import { STORE_ROUTES } from '../../config/store/store.config'
import { useMyStats } from '../../features/stats'
import { usePurchaseProduct, useStoreProduct } from '../../features/store'
import { useAuthStore } from '../../store/authStore'
import { centsToPoints, formatCents, formatPoints, getAvailablePoints, getDiscountForPoints } from '../../utils/store.utils'

const BackLink = ({ to }: { to: string }) => (
    <Link
        to={to}
        className="cursor-pointer rounded-lg border border-stone-700 bg-stone-800/70 px-4 py-2 text-sm font-medium text-stone-200 transition-colors hover:bg-stone-700"
    >
        Back
    </Link>
)

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-stone-400">{label}</span>
        <span className="min-w-0 break-all text-right text-stone-100">{value}</span>
    </div>
)

export const CheckoutPage = () => {
    const { productUuid } = useParams<{ productUuid: string }>()
    const navigate = useNavigate()
    const { data: product, isLoading } = useStoreProduct(productUuid)
    const { data: stats } = useMyStats()
    const purchaseMutation = usePurchaseProduct()
    const user = useAuthStore((state) => state.user)
    const [selectedPoints, setSelectedPoints] = useState<number | null>(null)

    const availablePoints = getAvailablePoints(stats)

    if (!product) {
        return (
            <StoreLayout title="Checkout" actions={<BackLink to={STORE_ROUTES.STORE} />}>
                <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-6 text-stone-300">
                    {isLoading ? 'Loading...' : 'This product could not be found.'}
                </div>
            </StoreLayout>
        )
    }

    const { points_used: maxPoints, discount_cents: maxDiscountCents } = product.points_discount
    const requestedPoints = Math.min(selectedPoints ?? maxPoints, maxPoints)
    const discountCents = getDiscountForPoints(requestedPoints, product.points_per_currency_unit, product.price)
    const pointsUsed = discountCents > 0 ? centsToPoints(discountCents, product.points_per_currency_unit) : 0
    const total = product.price - discountCents
    const maxDiscountPercent = Math.round((maxDiscountCents / product.price) * 100)
    const discountPercent = Math.round((discountCents / product.price) * 100)
    const isOwned = product.purchased

    const handlePointsChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSelectedPoints(Number(event.target.value))
    }

    const handlePay = async () => {
        const result = await purchaseMutation
            .mutateAsync({ productUuid: product.uuid, points: pointsUsed })
            .catch(() => null)

        if (result) {
            navigate(STORE_ROUTES.ORDERS)
        }
    }

    return (
        <StoreLayout title="Checkout" actions={<BackLink to={STORE_ROUTES.PRODUCT(product.uuid)} />}>
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex gap-4 rounded-2xl border border-stone-700 bg-stone-800/70 p-5">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-24 w-24 shrink-0 rounded-xl object-cover" />
                    ) : null}
                    <div className="min-w-0 space-y-1">
                        <h2 className="text-lg font-semibold text-stone-100">{product.name}</h2>
                        <p className="line-clamp-2 text-sm text-stone-400">{product.description}</p>
                    </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-stone-700 bg-stone-800/70 p-5">
                    <h3 className="text-base font-semibold text-stone-100">Customer details</h3>
                    <DetailRow label="Username" value={user?.username ?? '-'} />
                    <DetailRow label="Email" value={user?.email ?? '-'} />
                    <DetailRow label="Points balance" value={formatPoints(availablePoints)} />
                </div>

                <div className="space-y-3 rounded-2xl border border-stone-700 bg-stone-800/70 p-5">
                    <div className="flex items-center justify-between text-sm text-stone-300">
                        <span className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gold" />
                            Price
                        </span>
                        <span>{formatCents(product.price)}</span>
                    </div>
                    {product.max_discount_percent > 0 ? (
                        <div className="space-y-2 rounded-lg border border-stone-700 p-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5 font-medium text-amber-300">
                                    <Trophy className="h-4 w-4" />
                                    Store points
                                </span>
                                <span className="text-stone-300">
                                    {maxPoints > 0 ? `${formatPoints(pointsUsed)} · ${discountPercent}% off` : 'None available'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={maxPoints}
                                step={1}
                                value={requestedPoints}
                                disabled={maxPoints === 0}
                                onChange={handlePointsChange}
                                aria-label="Points to use"
                                className="w-full cursor-pointer accent-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <div className="flex justify-between text-xs text-stone-500">
                                <span>0%</span>
                                <span>
                                    Up to {maxDiscountPercent}% ({formatPoints(maxPoints)}) with your points
                                </span>
                            </div>
                            <p className="text-xs text-stone-500">
                                You have {formatPoints(availablePoints)}. Using points will not affect your leaderboard status.
                            </p>
                        </div>
                    ) : null}
                    {discountCents > 0 ? (
                        <div className="flex items-center justify-between text-sm text-amber-300">
                            <span>Points discount</span>
                            <span>-{formatCents(discountCents)}</span>
                        </div>
                    ) : null}
                    <div className="flex items-center justify-between border-t border-stone-700 pt-3">
                        <span className="text-base font-semibold text-stone-100">Total</span>
                        <span className="text-2xl font-black text-gold">{formatCents(total)}</span>
                    </div>
                </div>

                {isOwned ? (
                    <Link
                        to={STORE_ROUTES.ORDERS}
                        className="block cursor-pointer rounded-lg border border-gold/30 bg-gold/10 px-4 py-2.5 text-center text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
                    >
                        Owned · View in My Orders
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={handlePay}
                        disabled={purchaseMutation.isPending}
                        className="w-full cursor-pointer rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {purchaseMutation.isPending
                            ? 'Processing...'
                            : total === 0
                              ? `Get it with ${formatPoints(pointsUsed)}`
                              : `Pay ${formatCents(total)}`}
                    </button>
                )}
            </div>
        </StoreLayout>
    )
}
