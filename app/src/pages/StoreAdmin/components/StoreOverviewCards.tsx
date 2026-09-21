import { useStoreOverview } from '../../../features/store'
import { formatCents, formatPoints } from '../../../utils/store.utils'

const CARD_CLASS = 'rounded-xl border border-stone-700 bg-stone-800/70 p-4'
const LABEL_CLASS = 'text-xs uppercase tracking-wider text-stone-400'

export const StoreOverviewCards = () => {
    const { data, isLoading, isError } = useStoreOverview()

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-xl border border-stone-700 bg-stone-800/70" />
                ))}
            </div>
        )
    }

    if (isError || !data) {
        return (
            <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-4 text-red-200">
                Failed to load store overview.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className={CARD_CLASS}>
                <p className={LABEL_CLASS}>Orders</p>
                <p className="mt-2 text-2xl font-bold text-amber-300">{data.total_orders}</p>
                <p className="mt-1 text-xs text-stone-400">
                    Paid {data.paid_orders} · Pending {data.pending_orders} · Cancelled {data.cancelled_orders}
                </p>
            </div>
            <div className={CARD_CLASS}>
                <p className={LABEL_CLASS}>Products</p>
                <p className="mt-2 text-2xl font-bold text-stone-100">{data.total_products}</p>
            </div>
            <div className={CARD_CLASS}>
                <p className={LABEL_CLASS}>Online revenue</p>
                <p className="mt-2 text-2xl font-bold text-emerald-300">{formatCents(data.online_revenue)}</p>
                <p className="mt-1 text-xs text-stone-400">Paid orders only</p>
            </div>
            <div className={CARD_CLASS}>
                <p className={LABEL_CLASS}>Points spent</p>
                <p className="mt-2 text-2xl font-bold text-amber-300">{formatPoints(data.points_revenue)}</p>
                <p className="mt-1 text-xs text-stone-400">Paid orders only</p>
            </div>
        </div>
    )
}
