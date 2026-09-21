import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, ORDER_STATUSES } from '../../../config/store/store.config'
import type { Order } from '../../../features/store/interfaces/store.interface'
import { formatDateTime, formatPrice } from '../../../utils/store.utils'
import { OrderFilesList } from './OrderFilesList'

interface OrderCardProps {
    order: Order
    downloadingFileUuid: string | null
    onDownload: (orderUuid: string, fileUuid: string) => void
}

export const OrderCard = ({ order, downloadingFileUuid, onDownload }: OrderCardProps) => {
    const handleDownload = (fileUuid: string) => {
        onDownload(order.uuid, fileUuid)
    }

    const isPaid = order.status === ORDER_STATUSES.PAID
    const isPending = order.status === ORDER_STATUSES.PENDING

    return (
        <article className="space-y-4 rounded-xl border border-stone-700 bg-stone-800/70 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-amber-300">{order.product.name}</h2>
                    <p className="text-xs text-stone-500">
                        Ordered {formatDateTime(order.created_at)} · {formatPrice(order.payment_method, order.total)}
                    </p>
                </div>
                <span
                    className={`w-fit rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${ORDER_STATUS_STYLES[order.status]}`}
                >
                    {ORDER_STATUS_LABELS[order.status]}
                </span>
            </div>

            {isPaid && order.files.length > 0 ? (
                <OrderFilesList
                    files={order.files}
                    downloadingFileUuid={downloadingFileUuid}
                    onDownload={handleDownload}
                />
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
