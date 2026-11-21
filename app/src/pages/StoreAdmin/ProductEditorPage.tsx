import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { STORE_ROUTES } from '../../config/store/store.config'
import { useAdminProducts, useCreateAdminProduct, useUpdateAdminProduct } from '../../features/store'
import type { UpdateProductPayload } from '../../features/store/interfaces/store.interface'
import { ProductForm } from './components/ProductForm'
import { StoreAdminLayout } from './components/StoreAdminLayout'

const BackToProducts = () => (
    <Link
        to={STORE_ROUTES.ADMIN_PRODUCTS}
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-400 transition-colors hover:text-stone-200"
    >
        <ArrowLeft className="h-4 w-4" />
        Back to products
    </Link>
)

const FormSkeleton = () => (
    <div className="space-y-4" role="status" aria-label="Loading product">
        {[16, 28, 12, 12, 40].map((height, index) => (
            <div key={index} className="animate-pulse rounded-lg bg-stone-700/50" style={{ height: `${height * 4}px` }} />
        ))}
    </div>
)

export const ProductEditorPage = () => {
    const { productUuid } = useParams<{ productUuid: string }>()
    const navigate = useNavigate()
    const isEditing = productUuid !== undefined
    const { data: products, isLoading } = useAdminProducts()
    const createMutation = useCreateAdminProduct()
    const updateMutation = useUpdateAdminProduct()
    const product = isEditing ? products?.find((item) => item.uuid === productUuid) : undefined

    const goToList = () => {
        navigate(STORE_ROUTES.ADMIN_PRODUCTS)
    }

    const handleSubmit = async (payload: UpdateProductPayload) => {
        const request = isEditing
            ? updateMutation.mutateAsync({ productUuid, payload })
            : createMutation.mutateAsync(payload)

        await request.then(goToList, () => undefined)
    }

    const title = isEditing ? 'Edit product' : 'New product'
    const description = isEditing ? (product?.name ?? 'Update product details.') : 'Create a product for the store.'

    return (
        <StoreAdminLayout title={title} description={description}>
            <BackToProducts />

            <div className="rounded-2xl border border-stone-700 bg-stone-800/70 p-5 sm:p-6">
                {isEditing && isLoading ? <FormSkeleton /> : null}

                {isEditing && !isLoading && !product ? (
                    <p className="text-stone-300">This product could not be found.</p>
                ) : null}

                {!isEditing || product ? (
                    <ProductForm
                        key={product?.uuid ?? 'new'}
                        product={product}
                        isSaving={createMutation.isPending || updateMutation.isPending}
                        onCancel={goToList}
                        onSubmit={handleSubmit}
                    />
                ) : null}
            </div>
        </StoreAdminLayout>
    )
}
