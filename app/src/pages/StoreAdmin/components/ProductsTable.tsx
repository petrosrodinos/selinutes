import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { ConfirmationDialog } from '../../../components/ConfirmationDialog'
import { PRODUCT_TYPE_LABELS } from '../../../config/store/store.config'
import { useAdminProducts, useDeleteAdminProduct } from '../../../features/store'
import type { Product } from '../../../features/store/interfaces/store.interface'
import { formatCents, formatDateTime } from '../../../utils/store.utils'

interface ProductsTableProps {
    onEdit: (product: Product) => void
}

interface ProductRowProps {
    product: Product
    onEdit: (product: Product) => void
}

interface DeleteProductButtonProps {
    product: Product
    onDelete: (product: Product) => void
}

const EditProductButton = ({ product, onEdit }: ProductRowProps) => {
    const handleClick = () => {
        onEdit(product)
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-700 px-3 py-1.5 text-xs font-medium text-stone-300 transition-colors hover:bg-stone-700 hover:text-stone-100"
            aria-label={`Edit ${product.name}`}
        >
            <Pencil className="h-3.5 w-3.5" />
            Edit
        </button>
    )
}

const DeleteProductButton = ({ product, onDelete }: DeleteProductButtonProps) => {
    const handleClick = () => {
        onDelete(product)
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/10"
            aria-label={`Delete ${product.name}`}
        >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
        </button>
    )
}

export const ProductsTable = ({ onEdit }: ProductsTableProps) => {
    const { data: products, isLoading, isError } = useAdminProducts()
    const deleteMutation = useDeleteAdminProduct()
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)
    const productList = products ?? []

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return

        await deleteMutation.mutateAsync(productToDelete.uuid).catch(() => undefined)
        setProductToDelete(null)
    }

    const handleCloseDelete = () => {
        setProductToDelete(null)
    }

    if (isLoading) {
        return (
            <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-6 text-stone-300">Loading products...</div>
        )
    }

    if (isError) {
        return (
            <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-6 text-red-200">
                Failed to load products.
            </div>
        )
    }

    if (productList.length === 0) {
        return (
            <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-6 text-stone-400">
                No products yet. Create the first one.
            </div>
        )
    }

    return (
        <>
        <div className="overflow-hidden rounded-xl border border-stone-700 bg-stone-800/70">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-stone-900/60">
                        <tr className="text-left text-xs uppercase tracking-wider text-stone-400">
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Points discount</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Quantity</th>
                            <th className="px-4 py-3">Files</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {productList.map((product) => (
                            <tr key={product.uuid} className="border-t border-stone-700/60 align-top text-sm">
                                <td className="px-4 py-3">
                                    <div className="flex items-start gap-3">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                loading="lazy"
                                                className="h-12 w-16 shrink-0 rounded-md border border-stone-700 object-cover"
                                            />
                                        ) : null}
                                        <div className="min-w-0">
                                            <p className="font-medium text-amber-300">{product.name}</p>
                                            {product.description ? (
                                                <p className="max-w-xs truncate text-xs text-stone-500">{product.description}</p>
                                            ) : null}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-stone-300">{PRODUCT_TYPE_LABELS[product.type]}</td>
                                <td className="px-4 py-3 text-stone-300">
                                    {product.max_discount_percent > 0 ? `${product.max_discount_percent}%` : 'Not allowed'}
                                </td>
                                <td className="px-4 py-3 text-stone-200">
                                    {formatCents(product.price)}
                                </td>
                                <td className="px-4 py-3 text-stone-200">{product.quantity}</td>
                                <td className="px-4 py-3 text-stone-200">{product.files.length}</td>
                                <td className="px-4 py-3 text-stone-400">{formatDateTime(product.created_at)}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <EditProductButton product={product} onEdit={onEdit} />
                                        <DeleteProductButton product={product} onDelete={setProductToDelete} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <ConfirmationDialog
            isOpen={productToDelete !== null}
            onClose={handleCloseDelete}
            onConfirm={handleDeleteConfirm}
            title="Delete Product"
            message={`This permanently deletes "${productToDelete?.name ?? ''}" and its files. Products that already have orders cannot be deleted.`}
            confirmText={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            cancelText="Cancel"
            isConfirming={deleteMutation.isPending}
        />
        </>
    )
}
