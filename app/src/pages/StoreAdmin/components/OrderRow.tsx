import {
    ORDER_STATUS_LABELS,
    ORDER_STATUS_STYLES,
    ORDER_STATUSES,
    PAYMENT_METHOD_LABELS,
} from '../../../config/store/store.config'
import type { AdminOrder } from '../../../features/store/interfaces/store.interface'
import { formatCents, formatDateTime, formatPoints, formatPrice } from '../../../utils/store.utils'

const ORDER_ID_PREVIEW_LENGTH = 8

interface OrderRowProps {
    order: AdminOrder
    onView: (order: AdminOrder) => void
    onCancel: (order: AdminOrder) => void
    onDelete: (order: AdminOrder) => void
}

export const OrderRow = ({ order, onView, onCancel, onDelete }: OrderRowProps) => {
    const handleView = () => {
        onView(order)
    }

    const handleCancel = () => {
        onCancel(order)
    }

    const handleDelete = () => {
        onDelete(order)
    }

    const canCancel = order.status !== ORDER_STATUSES.CANCELLED

    return (
        <tr className="border-t border-stone-700/60 text-sm">
            <td className="px-4 py-3 font-mono text-xs text-stone-400">{order.uuid.slice(0, ORDER_ID_PREVIEW_LENGTH)}</td>
            <td className="px-4 py-3">
                <p className="font-medium text-amber-300">{order.user.username}</p>
                <p className="text-xs text-stone-500">{order.user.email}</p>
            </td>
            <td className="px-4 py-3 text-stone-200">{order.product.name}</td>
            <td className="px-4 py-3">
                <p className="text-stone-200">{formatPrice(order.payment_method, order.total)}</p>
                <p className="text-xs text-stone-500">
                    {order.total === 0 && order.points_used > 0 ? 'In-game points' : PAYMENT_METHOD_LABELS[order.payment_method]}
                    {order.points_used > 0 ? ` · ${formatPoints(order.points_used)} used` : ''}
                </p>
            </td>
            <td className="px-4 py-3 text-stone-200">
                {order.stripe_fee_cents === null ? <span className="text-stone-500">—</span> : formatCents(order.stripe_fee_cents)}
            </td>
            <td className="px-4 py-3">
                <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${ORDER_STATUS_STYLES[order.status]}`}
                >
                    {ORDER_STATUS_LABELS[order.status]}
                </span>
            </td>
            <td className="px-4 py-3 text-stone-400">{formatDateTime(order.created_at)}</td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleView}
                        className="cursor-pointer rounded-lg border border-stone-600 px-3 py-1.5 text-xs font-medium text-stone-200 transition-colors hover:bg-stone-700"
                    >
                        View
                    </button>
                    {canCancel ? (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="cursor-pointer rounded-lg border border-amber-500/40 px-3 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/10"
                        >
                            Cancel
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="cursor-pointer rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/10"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    )
}
