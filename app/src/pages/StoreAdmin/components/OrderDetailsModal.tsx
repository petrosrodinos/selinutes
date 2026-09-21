import type { ReactNode } from 'react'
import { Modal } from '../../../components/Modal'
import {
    ORDER_STATUS_LABELS,
    ORDER_STATUS_STYLES,
    PAYMENT_METHOD_LABELS,
    PRODUCT_TYPE_LABELS,
} from '../../../config/store/store.config'
import { useAdminOrder } from '../../../features/store'
import { formatDateTime, formatFileSize, formatPrice } from '../../../utils/store.utils'

interface OrderDetailsModalProps {
    orderUuid: string | null
    onClose: () => void
}

interface DetailRowProps {
    label: string
    children: ReactNode
}

const DetailRow = ({ label, children }: DetailRowProps) => (
    <div className="grid grid-cols-3 gap-3 border-b border-stone-700/50 py-2 text-sm last:border-b-0">
        <dt className="text-stone-400">{label}</dt>
        <dd className="col-span-2 break-words text-stone-200">{children}</dd>
    </div>
)

export const OrderDetailsModal = ({ orderUuid, onClose }: OrderDetailsModalProps) => {
    const { data: order, isLoading, isError } = useAdminOrder(orderUuid)

    return (
        <Modal isOpen={orderUuid !== null} onClose={onClose} title="Order details" size="xl">
            {isLoading ? <p className="text-stone-300">Loading order...</p> : null}
            {isError ? <p className="text-red-200">Failed to load order.</p> : null}
            {order ? (
                <dl>
                    <DetailRow label="Order ID">{order.uuid}</DetailRow>
                    <DetailRow label="Status">
                        <span
                            className={`rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${ORDER_STATUS_STYLES[order.status]}`}
                        >
                            {ORDER_STATUS_LABELS[order.status]}
                        </span>
                    </DetailRow>
                    <DetailRow label="Customer">
                        {order.user.username} · {order.user.email}
                    </DetailRow>
                    <DetailRow label="Product">
                        {order.product.name} · {PRODUCT_TYPE_LABELS[order.product.type]}
                    </DetailRow>
                    <DetailRow label="Payment">
                        {PAYMENT_METHOD_LABELS[order.payment_method]} · {formatPrice(order.payment_method, order.total)}
                    </DetailRow>
                    <DetailRow label="Created">{formatDateTime(order.created_at)}</DetailRow>
                    {order.paid_at ? <DetailRow label="Paid">{formatDateTime(order.paid_at)}</DetailRow> : null}
                    {order.cancelled_at ? (
                        <DetailRow label="Cancelled">{formatDateTime(order.cancelled_at)}</DetailRow>
                    ) : null}
                    {order.stripe_payment_intent_id ? (
                        <DetailRow label="Stripe payment">{order.stripe_payment_intent_id}</DetailRow>
                    ) : null}
                    <DetailRow label="Files">
                        {order.files.length === 0 ? (
                            <span className="text-stone-500">None</span>
                        ) : (
                            <ul className="space-y-1">
                                {order.files.map((file) => (
                                    <li key={file.uuid}>
                                        {file.name} <span className="text-stone-500">{formatFileSize(file.size)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </DetailRow>
                </dl>
            ) : null}
        </Modal>
    )
}
