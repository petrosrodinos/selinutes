import { useState } from 'react'
import { ConfirmationDialog } from '../../../components/ConfirmationDialog'
import { PAYMENT_METHODS } from '../../../config/store/store.config'
import { useAdminOrders, useCancelAdminOrder, useDeleteAdminOrder } from '../../../features/store'
import type { AdminOrder } from '../../../features/store/interfaces/store.interface'
import { OrderDetailsModal } from './OrderDetailsModal'
import { OrderRow } from './OrderRow'

export const OrdersTable = () => {
    const { data: orders, isLoading, isError } = useAdminOrders()
    const cancelMutation = useCancelAdminOrder()
    const deleteMutation = useDeleteAdminOrder()
    const [viewedOrderUuid, setViewedOrderUuid] = useState<string | null>(null)
    const [orderToCancel, setOrderToCancel] = useState<AdminOrder | null>(null)
    const [orderToDelete, setOrderToDelete] = useState<AdminOrder | null>(null)

    const orderList = orders ?? []
    const cancelRefundsPoints = orderToCancel?.payment_method === PAYMENT_METHODS.POINTS

    const handleView = (order: AdminOrder) => {
        setViewedOrderUuid(order.uuid)
    }

    const handleCloseDetails = () => {
        setViewedOrderUuid(null)
    }

    const handleCancelConfirm = async () => {
        if (!orderToCancel) return

        await cancelMutation.mutateAsync(orderToCancel.uuid).catch(() => undefined)
        setOrderToCancel(null)
    }

    const handleDeleteConfirm = async () => {
        if (!orderToDelete) return

        await deleteMutation.mutateAsync(orderToDelete.uuid).catch(() => undefined)
        setOrderToDelete(null)
    }

    const handleCloseCancel = () => {
        setOrderToCancel(null)
    }

    const handleCloseDelete = () => {
        setOrderToDelete(null)
    }

    if (isLoading) {
        return (
            <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-6 text-stone-300">Loading orders...</div>
        )
    }

    if (isError) {
        return (
            <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-6 text-red-200">
                Failed to load orders.
            </div>
        )
    }

    if (orderList.length === 0) {
        return (
            <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-6 text-stone-400">No orders yet.</div>
        )
    }

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-stone-700 bg-stone-800/70">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-stone-900/60">
                            <tr className="text-left text-xs uppercase tracking-wider text-stone-400">
                                <th className="px-4 py-3">Order</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Product</th>
                                <th className="px-4 py-3">Payment</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderList.map((order) => (
                                <OrderRow
                                    key={order.uuid}
                                    order={order}
                                    onView={handleView}
                                    onCancel={setOrderToCancel}
                                    onDelete={setOrderToDelete}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderDetailsModal orderUuid={viewedOrderUuid} onClose={handleCloseDetails} />

            <ConfirmationDialog
                isOpen={orderToCancel !== null}
                onClose={handleCloseCancel}
                onConfirm={handleCancelConfirm}
                title="Cancel Order"
                message={
                    cancelRefundsPoints
                        ? 'The customer loses access to the files and the spent points are returned to them.'
                        : 'The customer loses access to the files. Online payments are not refunded automatically; refund it in Stripe if needed.'
                }
                confirmText={cancelMutation.isPending ? 'Cancelling...' : 'Cancel order'}
                cancelText="Keep order"
                isConfirming={cancelMutation.isPending}
            />

            <ConfirmationDialog
                isOpen={orderToDelete !== null}
                onClose={handleCloseDelete}
                onConfirm={handleDeleteConfirm}
                title="Delete Order"
                message="This permanently removes the order record. Points are not refunded; cancel the order first if the customer should get them back."
                confirmText={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                cancelText="Cancel"
                isConfirming={deleteMutation.isPending}
            />
        </>
    )
}
