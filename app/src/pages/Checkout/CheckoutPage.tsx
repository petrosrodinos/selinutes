import { CreditCard, Trophy } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { StoreLayout } from '../../components/StoreLayout'
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, STORE_ROUTES } from '../../config/store/store.config'
import { useMyStats } from '../../features/stats'
import { usePurchaseProduct, useStoreProduct } from '../../features/store'
import { useAuthStore } from '../../store/authStore'
import { formatPoints, formatPrice, getAvailablePoints } from '../../utils/store.utils'

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

    const isPoints = product.payment_method === PAYMENT_METHODS.POINTS
    const PaymentIcon = isPoints ? Trophy : CreditCard
    const missingPoints = isPoints ? Math.max(0, product.price - availablePoints) : 0
    const isOwned = product.purchased
    const canPay = !isOwned && missingPoints === 0

    const handlePay = async () => {
        const result = await purchaseMutation.mutateAsync(product.uuid).catch(() => null)

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
                            <PaymentIcon className="h-4 w-4 text-gold" />
                            Payment method
                        </span>
                        <span>{PAYMENT_METHOD_LABELS[product.payment_method]}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-stone-700 pt-3">
                        <span className="text-base font-semibold text-stone-100">Total</span>
                        <span className="text-2xl font-black text-gold">{formatPrice(product.payment_method, product.price)}</span>
                    </div>
                    {isPoints ? (
                        <p className="text-xs text-stone-500">
                            You have {formatPoints(availablePoints)} to spend. This will not affect your leaderboard status.
                        </p>
                    ) : null}
                </div>

                {isOwned ? (
                    <Link
                        to={STORE_ROUTES.ORDERS}
                        className="block cursor-pointer rounded-lg border border-gold/30 bg-gold/10 px-4 py-2.5 text-center text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
                    >
                        Owned · View in My Orders
                    </Link>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={handlePay}
                            disabled={!canPay || purchaseMutation.isPending}
                            className="w-full cursor-pointer rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {purchaseMutation.isPending ? 'Processing...' : `Pay ${formatPrice(product.payment_method, product.price)}`}
                        </button>
                        {missingPoints > 0 ? (
                            <p className="text-center text-xs text-stone-500">You need {formatPoints(missingPoints)} more</p>
                        ) : null}
                    </>
                )}
            </div>
        </StoreLayout>
    )
}
