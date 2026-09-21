import { StoreAdminLayout } from './components/StoreAdminLayout'
import { StoreOverviewCards } from './components/StoreOverviewCards'
import { OrdersTable } from './components/OrdersTable'

export const StoreOverviewPage = () => {
    return (
        <StoreAdminLayout title="Store Dashboard" description="Review store activity and manage customer orders.">
            <StoreOverviewCards />
            <OrdersTable />
        </StoreAdminLayout>
    )
}
