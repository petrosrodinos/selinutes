import { useNavigate } from 'react-router-dom'
import { STORE_ROUTES } from '../../../config/store/store.config'
import type { StoreProduct } from '../../../features/store'

export const useProductPurchase = () => {
    const navigate = useNavigate()

    const handlePurchase = (product: StoreProduct) => {
        navigate(STORE_ROUTES.CHECKOUT(product.uuid))
    }

    return { purchasingUuid: null, handlePurchase }
}
