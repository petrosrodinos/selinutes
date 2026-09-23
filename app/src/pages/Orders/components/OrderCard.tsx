import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, ORDER_STATUSES } from '../../../config/store/store.config'
import type { Order } from '../../../features/store/interfaces/store.interface'
import { Download } from 'lucide-react'
import { formatDateTime, formatPrice } from '../../../utils/store.utils'

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
                            Ordered {formatDateTime(order.created_at)} · {formatPrice(order.payment_method, order.total)}
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
