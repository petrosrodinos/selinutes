import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, ORDER_STATUSES } from '../../../config/store/store.config'
import type { Order } from '../../../features/store/interfaces/store.interface'
import { Download } from 'lucide-react'
import { STORE_MINOR_UNITS_PER_CURRENCY_UNIT } from '../../../config/store/store.config'
import { formatCents, formatDateTime, formatPoints, formatPrice } from '../../../utils/store.utils'

interface OrderCardProps {
    order: Order
    isDownloading: boolean
    onDownload: (orderUuid: string, filename: string) => void
}

export const OrderCard = ({ order, isDownloading, onDownload }: OrderCardProps) => {
    const handleDownload = () => {
        onDownload(order.uuid, `${order.product.name}.zip`)
    }

    const isPaid = order.status === ORDER_STATUSES.PAID
    const isPending = order.status === ORDER_STATUSES.PENDING

    return (
        <article className="space-y-4 rounded-xl border border-stone-700 bg-stone-800/70 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                    {order.product.image_url ? (
                        <img
                            src={order.product.image_url}
                            alt={order.product.name}
                            className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                    ) : null}
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-amber-300">{order.product.name}</h2>
                        <p className="text-xs text-stone-500">
                            Ordered {formatDateTime(order.created_at)} · {order.payment_summary ?? formatPrice(order.payment_method, order.total)}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                    <span
                        className={`w-fit rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${ORDER_STATUS_STYLES[order.status]}`}
                    >
                        {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    {isPaid ? (
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="flex cursor-pointer items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Download className="h-4 w-4" />
                            {isDownloading ? 'Preparing zip...' : 'Download all (.zip)'}
                        </button>
                    ) : null}
                </div>
            </div>

            {order.points_used > 0 ? (
                <dl className="space-y-1 rounded-lg border border-stone-700/60 bg-stone-900/40 p-3 text-sm">
                    {order.price_cents !== null ? (
                        <div className="flex justify-between gap-4">
                            <dt className="text-stone-400">Product price</dt>
                            <dd className="text-stone-200">{formatCents(order.price_cents)}</dd>
                        </div>
                    ) : null}
                    <div className="flex justify-between gap-4">
                        <dt className="text-stone-400">Points used</dt>
                        <dd className="text-amber-300">
                            {formatPoints(order.points_used)} (−{formatCents(order.discount_cents)})
                        </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-stone-700/60 pt-1">
                        <dt className="text-stone-300">Paid</dt>
                        <dd className="font-semibold text-stone-100">{formatCents(order.total)}</dd>
                    </div>
                    {order.points_per_currency_unit !== null ? (
                        <p className="pt-1 text-xs text-stone-500">
                            Points rate when you ordered: {formatPoints(order.points_per_currency_unit)} ={' '}
                            {formatCents(STORE_MINOR_UNITS_PER_CURRENCY_UNIT)}. Later rate changes do not affect this order.
                        </p>
                    ) : null}
                </dl>
            ) : null}

            {isPending ? (
                <p className="text-sm text-stone-400">
                    Payment was not completed. Buy the product again from the store to finish this order.
                </p>
            ) : null}

            {order.status === ORDER_STATUSES.CANCELLED ? (
                <p className="text-sm text-stone-400">This order was cancelled and its files are no longer available.</p>
            ) : null}
        </article>
    )
}
