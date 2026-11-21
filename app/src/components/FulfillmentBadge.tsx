import {
    FULFILLMENT_STATUS_LABELS,
    FULFILLMENT_STATUS_STYLES,
    type FulfillmentStatus,
} from '../config/store/store.config'

interface FulfillmentBadgeProps {
    status: FulfillmentStatus
}

export const FulfillmentBadge = ({ status }: FulfillmentBadgeProps) => (
    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide ${FULFILLMENT_STATUS_STYLES[status]}`}>
        {FULFILLMENT_STATUS_LABELS[status]}
    </span>
)
