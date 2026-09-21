import { ConfirmationDialog } from '../../../components/ConfirmationDialog'
import type { StoreProduct } from '../../../features/store'
import { formatPoints } from '../../../utils/store.utils'

interface PurchaseConfirmDialogProps {
    product: StoreProduct | null
    isConfirming: boolean
    onClose: () => void
    onConfirm: () => void
}

export const PurchaseConfirmDialog = ({ product, isConfirming, onClose, onConfirm }: PurchaseConfirmDialogProps) => (
    <ConfirmationDialog
        isOpen={product !== null}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Confirm Purchase"
        message={`Spend ${formatPoints(product?.price ?? 0)} on ${product?.name ?? 'this product'}? This will not affect your leaderboard status.`}
        confirmText={isConfirming ? 'Purchasing...' : 'Buy'}
        cancelText="Cancel"
        isConfirming={isConfirming}
    />
)
