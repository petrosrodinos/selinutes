import type { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FulfillmentBadge } from '../../../components/FulfillmentBadge'
import { Modal } from '../../../components/Modal'
import { Select, type SelectOption } from '../../../components/ui/Select'
import { ShippingAddressBlock } from '../../../components/ShippingAddressBlock'
import {
    ORDER_STATUS_LABELS,
    ORDER_STATUS_STYLES,
    PAYMENT_METHOD_LABELS,
    FULFILLMENT_STATUS_LABELS,
    FULFILLMENT_STATUS_ORDER,
    FULFILLMENT_STATUSES,
    ORDER_STATUSES,
    PRODUCT_TYPES,
    PRODUCT_TYPE_LABELS,
    STORE_ROUTES,
} from '../../../config/store/store.config'
import { useAdminOrder, useUpdateOrderFulfillment } from '../../../features/store'
import { formatCents, formatDateTime, formatFileSize, formatPoints, formatPrice } from '../../../utils/store.utils'

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

const FULFILLMENT_OPTIONS: SelectOption[] = FULFILLMENT_STATUS_ORDER.map((status) => ({
    value: status,
    label: FULFILLMENT_STATUS_LABELS[status],
}))

const isFulfillmentStatus = (value: string): value is (typeof FULFILLMENT_STATUS_ORDER)[number] =>
    FULFILLMENT_STATUS_ORDER.some((status) => status === value)

export const OrderDetailsModal = ({ orderUuid, onClose }: OrderDetailsModalProps) => {
    const { data: order, isLoading, isError } = useAdminOrder(orderUuid)
    const fulfillmentMutation = useUpdateOrderFulfillment()

    const handleFulfillmentChange = (status: string) => {
        if (!order || !isFulfillmentStatus(status) || status === order.fulfillment_status) return

        fulfillmentMutation.mutate({ orderUuid: order.uuid, status })
    }

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
                    {order.product.type === PRODUCT_TYPES.PHYSICAL ? (
                        <DetailRow label="Delivery status">
                            {order.status === ORDER_STATUSES.PAID ? (
                                <div className="max-w-xs">
                                    <Select
                                        value={order.fulfillment_status}
                                        options={
                                            order.product.requires_verification
                                                ? FULFILLMENT_OPTIONS
                                                : FULFILLMENT_OPTIONS.filter((option) => option.value !== FULFILLMENT_STATUSES.PENDING_VERIFICATION)
                                        }
                                        onChange={handleFulfillmentChange}
                                        disabled={fulfillmentMutation.isPending}
                                        ariaLabel="Delivery status"
                                    />
                                    {order.fulfillment_status === FULFILLMENT_STATUSES.DELIVERED ? (
                                        <p className="mt-1 text-xs text-emerald-300">Delivered to the customer.</p>
                                    ) : null}
                                </div>
                            ) : (
                                <span className="text-stone-500">
                                    Available once the order is paid <FulfillmentBadge status={order.fulfillment_status} />
                                </span>
                            )}
                        </DetailRow>
                    ) : null}
                    <DetailRow label="Customer">
                        {order.user.username} · {order.user.email}
                    </DetailRow>
                    {order.shipping_address ? (
                        <DetailRow label="Ship to">
                            <ShippingAddressBlock address={order.shipping_address} />
                        </DetailRow>
                    ) : null}
                    <DetailRow label="Product">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>
                                {order.product.name} · {PRODUCT_TYPE_LABELS[order.product.type]}
                            </span>
                            <Link
                                to={STORE_ROUTES.ADMIN_PRODUCT(order.product.uuid)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-amber-300 transition-colors hover:text-amber-200"
                            >
                                Open product
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>
                    </DetailRow>
                    <DetailRow label="Payment">
                        {order.total === 0 && order.points_used > 0 ? 'In-game points' : PAYMENT_METHOD_LABELS[order.payment_method]} ·{' '}
                        {order.payment_summary ?? formatPrice(order.payment_method, order.total)}
                    </DetailRow>
                    {order.payment_summary ? <DetailRow label="Shown to buyer">{order.payment_summary}</DetailRow> : null}
                    {order.price_cents !== null ? (
                        <DetailRow label="List price">{formatCents(order.price_cents)}</DetailRow>
                    ) : null}
                    {order.points_per_currency_unit !== null ? (
                        <DetailRow label="Points rate">
                            {formatPoints(order.points_per_currency_unit)} = {formatCents(100)} (at time of order)
                        </DetailRow>
                    ) : null}
                    {order.points_used > 0 ? (
                        <DetailRow label="Points used">
                            {formatPoints(order.points_used)} (−{formatCents(order.discount_cents)})
                        </DetailRow>
                    ) : null}
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
