import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { STORE_ROUTES } from '../../config/store/store.config'
import type { Product } from '../../features/store/interfaces/store.interface'
import { PointsRateCard } from './components/PointsRateCard'
import { ProductsTable } from './components/ProductsTable'
import { StoreAdminLayout } from './components/StoreAdminLayout'

export const StoreProductsPage = () => {
    const navigate = useNavigate()

    const handleEdit = (product: Product) => {
        navigate(STORE_ROUTES.ADMIN_PRODUCT(product.uuid))
    }

    return (
        <StoreAdminLayout title="Products" description="View, create and edit products.">
            <PointsRateCard />

            <div className="flex justify-end">
                <Link
                    to={STORE_ROUTES.ADMIN_PRODUCT_NEW}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-semibold text-stone-900 transition-colors hover:bg-amber-500"
                >
                    <Plus className="h-4 w-4" />
                    New product
                </Link>
            </div>

            <ProductsTable onEdit={handleEdit} />
        </StoreAdminLayout>
    )
}
