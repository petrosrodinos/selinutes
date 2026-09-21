import { Link } from 'react-router-dom'
import { StoreLayout } from '../../components/StoreLayout'
import { STORE_ROUTES } from '../../config/store/store.config'
import { useCheckoutReturn, useDownloadFile, useMyOrders } from '../../features/store'
import { OrderCard } from './components/OrderCard'

export const MyOrdersPage = () => {
    useCheckoutReturn()

    const { data: orders, isLoading, isError } = useMyOrders()
    const downloadMutation = useDownloadFile()

    const downloadingFileUuid = downloadMutation.isPending ? downloadMutation.variables.fileUuid : null
    const orderList = orders ?? []

    const handleDownload = (orderUuid: string, fileUuid: string) => {
        downloadMutation.mutate({ orderUuid, fileUuid })
    }

    const storeLink = (
        <Link
            to={STORE_ROUTES.STORE}
            className="cursor-pointer rounded-lg bg-stone-700 px-4 py-2 font-semibold text-stone-100 transition-colors hover:bg-stone-600"
        >
            Browse store
        </Link>
    )

    return (
        <StoreLayout title="My Orders" description="Your purchases and their files." actions={storeLink}>
            {isLoading ? (
                <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-6 text-stone-300">Loading orders...</div>
            ) : null}

            {isError ? (
                <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-6 text-red-200">Failed to load orders.</div>
            ) : null}

            {!isLoading && !isError && orderList.length === 0 ? (
                <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-6 text-stone-400">
                    You have not purchased anything yet.
                </div>
            ) : null}

            <div className="space-y-4">
                {orderList.map((order) => (
                    <OrderCard
                        key={order.uuid}
                        order={order}
                        downloadingFileUuid={downloadingFileUuid}
                        onDownload={handleDownload}
                    />
                ))}
            </div>
        </StoreLayout>
    )
}
