import { useState } from 'react'
import { PAYMENT_METHODS } from '../../../config/store/store.config'
import { usePurchaseProduct, type StoreProduct } from '../../../features/store'

export const useProductPurchase = () => {
    const purchaseMutation = usePurchaseProduct()
    const [productToBuy, setProductToBuy] = useState<StoreProduct | null>(null)

    const isRedirectingToCheckout = purchaseMutation.isSuccess && purchaseMutation.data.checkout_url !== null
    const purchasingUuid = purchaseMutation.isPending || isRedirectingToCheckout ? purchaseMutation.variables : null

    const handlePurchase = (product: StoreProduct) => {
        if (product.payment_method === PAYMENT_METHODS.POINTS) {
            setProductToBuy(product)
            return
        }

        purchaseMutation.mutate(product.uuid)
    }

    const handleConfirmPurchase = async () => {
        if (!productToBuy) return

        await purchaseMutation.mutateAsync(productToBuy.uuid).catch(() => undefined)
        setProductToBuy(null)
    }

    const handleCloseConfirm = () => {
        setProductToBuy(null)
    }

    return {
        productToBuy,
        purchasingUuid,
        isConfirming: purchaseMutation.isPending,
        handlePurchase,
        handleConfirmPurchase,
        handleCloseConfirm,
    }
}
