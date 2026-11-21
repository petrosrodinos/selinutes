import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react'
import { Check, CreditCard, Lock, Mail, Package, Trophy, Truck, User } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { StoreLayout } from '../../components/StoreLayout'
import { PRODUCT_TYPES, STORE_ROUTES } from '../../config/store/store.config'
import { useMyStats } from '../../features/stats'
import { useLastShippingAddress, usePurchaseProduct, useStoreProduct } from '../../features/store'
import type { ShippingAddress } from '../../features/store/interfaces/store.interface'
import { useAuthStore } from '../../store/authStore'
import {
    EMPTY_SHIPPING_ADDRESS,
    centsToPoints,
    formatCents,
    formatPoints,
    getAvailablePoints,
    getDiscountForPoints,
    getShippingFieldErrors,
    isProductOwned,
    type ShippingFieldErrors,
} from '../../utils/store.utils'
import { ShippingForm } from './ShippingForm'

const BackLink = ({ to }: { to: string }) => (
    <Link
        to={to}
        className="cursor-pointer rounded-lg border border-stone-700 bg-stone-800/70 px-4 py-2 text-sm font-medium text-stone-200 transition-colors hover:bg-stone-700"
    >
        Back
    </Link>
)

interface StepCardProps {
    step: number
    title: string
    subtitle?: string
    children: ReactNode
}

const StepCard = ({ step, title, subtitle, children }: StepCardProps) => (
    <section className="rounded-2xl border border-stone-700 bg-stone-800/70 p-5 sm:p-6">
        <header className="mb-5 flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-sm font-bold text-amber-300">
                {step}
            </span>
            <div className="min-w-0">
                <h2 className="text-base font-semibold text-stone-100">{title}</h2>
                {subtitle ? <p className="text-xs text-stone-500">{subtitle}</p> : null}
            </div>
        </header>
        {children}
    </section>
)

const SummaryLine = ({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) => (
    <div className={`flex items-center justify-between text-sm ${accent ? 'text-amber-300' : 'text-stone-300'}`}>
        <span>{label}</span>
        <span>{value}</span>
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
    const [shipping, setShipping] = useState<ShippingAddress>(EMPTY_SHIPPING_ADDRESS)
    const [isShippingPrefilled, setIsShippingPrefilled] = useState(false)
    const [showErrors, setShowErrors] = useState(false)
    const isPhysical = product?.type === PRODUCT_TYPES.PHYSICAL
    const { data: savedAddress } = useLastShippingAddress(isPhysical)

    useEffect(() => {
        if (!savedAddress || isShippingPrefilled) return

        setShipping({ ...EMPTY_SHIPPING_ADDRESS, ...savedAddress })
        setIsShippingPrefilled(true)
    }, [savedAddress, isShippingPrefilled])

    const availablePoints = getAvailablePoints(stats)

    if (!product) {
        return (
            <StoreLayout title="Checkout" actions={<BackLink to={STORE_ROUTES.STORE} />}>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]" role="status" aria-label="Loading checkout">
                    <div className="space-y-6">
                        <div className="h-40 animate-pulse rounded-2xl bg-stone-800/70" />
                        <div className="h-96 animate-pulse rounded-2xl bg-stone-800/70" />
                    </div>
                    <div className="h-80 animate-pulse rounded-2xl bg-stone-800/70" />
                </div>
                {!isLoading ? <p className="mt-4 text-stone-300">This product could not be found.</p> : null}
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
    const isOwned = isProductOwned(product)
    const shippingErrors: ShippingFieldErrors = isPhysical && showErrors ? getShippingFieldErrors(shipping) : {}
    const hasPoints = product.max_discount_percent > 0

    const handlePointsChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSelectedPoints(Number(event.target.value))
    }

    const handlePay = async () => {
        if (isPhysical && Object.keys(getShippingFieldErrors(shipping)).length > 0) {
            setShowErrors(true)
            return
        }

        const result = await purchaseMutation
            .mutateAsync({
                productUuid: product.uuid,
                points: pointsUsed,
                shipping: isPhysical
                    ? { ...shipping, line2: shipping.line2?.trim() || undefined, state: shipping.state?.trim() || undefined }
                    : undefined,
            })
            .catch(() => null)

        if (result) {
            navigate(STORE_ROUTES.ORDERS)
        }
    }

    const payLabel = purchaseMutation.isPending
        ? 'Processing...'
        : total === 0
          ? `Get it with ${formatPoints(pointsUsed)}`
          : `Pay ${formatCents(total)}`

    return (
        <StoreLayout title="Checkout" actions={<BackLink to={STORE_ROUTES.PRODUCT(product.uuid)} />}>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-5">
                    <StepCard step={1} title="Contact" subtitle="We use these details for your order">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex items-center gap-3 rounded-xl border border-stone-700 bg-stone-900/50 px-4 py-3">
                                <User className="h-4 w-4 shrink-0 text-stone-500" />
                                <div className="min-w-0">
                                    <p className="text-[11px] uppercase tracking-wide text-stone-500">Username</p>
                                    <p className="truncate text-sm text-stone-100">{user?.username ?? '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-stone-700 bg-stone-900/50 px-4 py-3">
                                <Mail className="h-4 w-4 shrink-0 text-stone-500" />
                                <div className="min-w-0">
                                    <p className="text-[11px] uppercase tracking-wide text-stone-500">Email</p>
                                    <p className="truncate text-sm text-stone-100">{user?.email ?? '-'}</p>
                                </div>
                            </div>
                        </div>
                    </StepCard>

                    {isPhysical ? (
                        <StepCard
                            step={2}
                            title="Delivery"
                            subtitle={isShippingPrefilled ? 'Filled in from your last order, edit if needed' : 'Where should we send your order?'}
                        >
                            <ShippingForm address={shipping} errors={shippingErrors} onChange={setShipping} />
                        </StepCard>
                    ) : null}

                    {hasPoints ? (
                        <StepCard
                            step={isPhysical ? 3 : 2}
                            title="Use your points"
                            subtitle={`You have ${formatPoints(availablePoints)} available`}
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="flex items-center gap-1.5 font-medium text-amber-300">
                                        <Trophy className="h-4 w-4" />
                                        {maxPoints > 0 ? `${formatPoints(pointsUsed)} · ${discountPercent}% off` : 'No points available'}
                                    </span>
                                    <span className="text-xs text-stone-500">
                                        Up to {maxDiscountPercent}% ({formatPoints(maxPoints)})
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
                                    className={`w-full cursor-pointer accent-amber-500 disabled:cursor-not-allowed disabled:opacity-50`}
                                />
                                <p className="text-xs text-stone-500">Using points will not affect your leaderboard status.</p>
                            </div>
                        </StepCard>
                    ) : null}
                </div>

                <aside className="space-y-4 rounded-2xl border border-stone-700 bg-stone-800/70 p-5 sm:p-6 lg:sticky lg:top-6">
                    <h2 className="text-base font-semibold text-stone-100">Order summary</h2>

                    <div className="flex gap-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-stone-700 bg-stone-900">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                                <Package className="m-auto h-full w-8 text-stone-600" />
                            )}
                        </div>
                        <div className="min-w-0 space-y-1">
                            <p className="font-medium text-amber-300">{product.name}</p>
                            <p className="line-clamp-2 text-xs text-stone-400">{product.description}</p>
                            {isPhysical ? (
                                <p className="flex items-center gap-1.5 text-xs text-stone-500">
                                    <Truck className="h-3.5 w-3.5" />
                                    Shipped to your address
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-2 border-t border-stone-700 pt-4">
                        <SummaryLine label="Price" value={formatCents(product.price)} />
                        {discountCents > 0 ? (
                            <SummaryLine label={`Points (${formatPoints(pointsUsed)})`} value={`-${formatCents(discountCents)}`} accent />
                        ) : null}
                        <div className="flex items-end justify-between border-t border-stone-700 pt-3">
                            <span className="flex items-center gap-2 text-base font-semibold text-stone-100">
                                <CreditCard className="h-4 w-4 text-gold" />
                                Total
                            </span>
                            <span className="text-3xl font-black text-gold">{formatCents(total)}</span>
                        </div>
                    </div>

                    {isOwned ? (
                        <Link
                            to={STORE_ROUTES.ORDERS}
                            className="block cursor-pointer rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-center text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
                        >
                            Owned · View in My Orders
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={handlePay}
                            disabled={purchaseMutation.isPending}
                            className="w-full cursor-pointer rounded-xl bg-gold px-4 py-3.5 text-sm font-bold text-ink shadow-lg shadow-amber-500/10 transition-all hover:bg-gold/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {payLabel}
                        </button>
                    )}

                    {isPhysical && showErrors && Object.keys(getShippingFieldErrors(shipping)).length > 0 ? (
                        <p role="alert" className="text-center text-xs text-rose-300">
                            Please fix the highlighted delivery fields.
                        </p>
                    ) : null}

                    <ul className="space-y-1.5 pt-1 text-xs text-stone-500">
                        <li className="flex items-center gap-2">
                            <Lock className="h-3.5 w-3.5" />
                            Secure online payment
                        </li>
                        {isPhysical ? (
                            <li className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5" />
                                Your address is saved with the order for shipping
                            </li>
                        ) : null}
                    </ul>
                </aside>
            </div>
        </StoreLayout>
    )
}
