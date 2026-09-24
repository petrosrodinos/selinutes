import { useState } from 'react'
import { Modal } from '../../components/Modal'
import { useCreateAdminProduct, useUpdateAdminProduct } from '../../features/store'
import type { Product, UpdateProductPayload } from '../../features/store/interfaces/store.interface'
import { PointsRateCard } from './components/PointsRateCard'
import { ProductForm } from './components/ProductForm'
import { ProductsTable } from './components/ProductsTable'
import { StoreAdminLayout } from './components/StoreAdminLayout'

export const StoreProductsPage = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const createMutation = useCreateAdminProduct()
    const updateMutation = useUpdateAdminProduct()

    const handleOpen = () => {
        setIsCreateOpen(true)
    }

    const handleClose = () => {
        setIsCreateOpen(false)
    }

    const handleEditClose = () => {
        setEditingProduct(null)
    }

    const handleCreate = async (payload: UpdateProductPayload) => {
        await createMutation.mutateAsync(payload).then(handleClose, () => undefined)
    }

    const handleUpdate = async (payload: UpdateProductPayload) => {
        if (!editingProduct) return

        await updateMutation
            .mutateAsync({ productUuid: editingProduct.uuid, payload })
            .then(handleEditClose, () => undefined)
    }

    return (
        <StoreAdminLayout title="Products" description="View, create and edit products.">
            <PointsRateCard />

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleOpen}
                    className="cursor-pointer rounded-lg bg-amber-600 px-4 py-2 font-semibold text-stone-900 transition-colors hover:bg-amber-500"
                >
                    New product
                </button>
            </div>

            <ProductsTable onEdit={setEditingProduct} />

            <Modal isOpen={isCreateOpen} onClose={handleClose} title="New product" size="xl" closeOnBackdropClick={false}>
                <ProductForm isSaving={createMutation.isPending} onCancel={handleClose} onSubmit={handleCreate} />
            </Modal>

            <Modal
                isOpen={editingProduct !== null}
                onClose={handleEditClose}
                title="Edit product"
                size="xl"
                closeOnBackdropClick={false}
            >
                {editingProduct ? (
                    <ProductForm
                        product={editingProduct}
                        isSaving={updateMutation.isPending}
                        onCancel={handleEditClose}
                        onSubmit={handleUpdate}
                    />
                ) : null}
            </Modal>
        </StoreAdminLayout>
    )
}
