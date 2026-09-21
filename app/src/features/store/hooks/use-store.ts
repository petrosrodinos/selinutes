import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { CHECKOUT_QUERY, ORDER_STATUSES } from '../../../config/store/store.config'
import { getErrorMessage } from '../../../lib/error'
import {
    cancelAdminOrder,
    confirmCheckout,
    createAdminProduct,
    deleteAdminOrder,
    deleteAdminProduct,
    getAdminOrder,
    getAdminOrders,
    getAdminProducts,
    getFileDownloadUrl,
    getMyOrders,
    getStoreOverview,
    getStoreProduct,
    getStoreProducts,
    purchaseProduct,
    updateAdminProduct,
} from '../services/store.service'

const STORE_KEYS = {
    products: ['store', 'products'],
    product: (productUuid: string | undefined) => ['store', 'product', productUuid],
    orders: ['store', 'orders'],
    adminOverview: ['store', 'admin', 'overview'],
    adminOrders: ['store', 'admin', 'orders'],
    adminOrder: (orderUuid: string | null) => ['store', 'admin', 'order', orderUuid],
    adminProducts: ['store', 'admin', 'products'],
} as const

export const useStoreProducts = () =>
    useQuery({
        queryKey: STORE_KEYS.products,
        queryFn: getStoreProducts,
    })

export const useStoreProduct = (productUuid: string | undefined) =>
    useQuery({
        queryKey: STORE_KEYS.product(productUuid),
        queryFn: () => getStoreProduct(productUuid as string),
        enabled: productUuid !== undefined,
    })

export const useMyOrders = () =>
    useQuery({
        queryKey: STORE_KEYS.orders,
        queryFn: getMyOrders,
    })

export const usePurchaseProduct = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: purchaseProduct,
        onSuccess: async (result) => {
            if (result.checkout_url) {
                window.location.assign(result.checkout_url)
                return
            }

            toast.success('Purchase completed')
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: STORE_KEYS.products }),
                queryClient.invalidateQueries({ queryKey: STORE_KEYS.orders }),
                queryClient.invalidateQueries({ queryKey: ['stats', 'me'] }),
            ])
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })
}

export const useDownloadFile = () =>
    useMutation({
        mutationFn: ({ orderUuid, fileUuid }: { orderUuid: string; fileUuid: string }) =>
            getFileDownloadUrl(orderUuid, fileUuid),
        onSuccess: ({ url }) => {
            window.location.assign(url)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })

export const useCheckoutReturn = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const queryClient = useQueryClient()
    const handledRef = useRef(false)
    const status = searchParams.get(CHECKOUT_QUERY.STATUS_PARAM)
    const sessionId = searchParams.get(CHECKOUT_QUERY.SESSION_PARAM)

    useEffect(() => {
        if (!status || handledRef.current) return
        handledRef.current = true

        setSearchParams({}, { replace: true })

        if (status === CHECKOUT_QUERY.CANCELLED) {
            toast.info('Checkout cancelled')
            return
        }

        if (status !== CHECKOUT_QUERY.SUCCESS || !sessionId) return

        confirmCheckout(sessionId)
            .then(async (order) => {
                await queryClient.invalidateQueries({ queryKey: STORE_KEYS.orders })
                await queryClient.invalidateQueries({ queryKey: STORE_KEYS.products })
                if (order.status === ORDER_STATUSES.PAID) {
                    toast.success('Payment received')
                } else {
                    toast.info('Payment is still processing')
                }
            })
            .catch((error) => {
                toast.error(getErrorMessage(error))
            })
    }, [status, sessionId, setSearchParams, queryClient])
}

export const useStoreOverview = () =>
    useQuery({
        queryKey: STORE_KEYS.adminOverview,
        queryFn: getStoreOverview,
    })

export const useAdminOrders = () =>
    useQuery({
        queryKey: STORE_KEYS.adminOrders,
        queryFn: getAdminOrders,
    })

export const useAdminOrder = (orderUuid: string | null) =>
    useQuery({
        queryKey: STORE_KEYS.adminOrder(orderUuid),
        queryFn: () => getAdminOrder(orderUuid as string),
        enabled: orderUuid !== null,
    })

export const useCancelAdminOrder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: cancelAdminOrder,
        onSuccess: async () => {
            toast.success('Order cancelled')
            await queryClient.invalidateQueries({ queryKey: ['store', 'admin'] })
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })
}

export const useDeleteAdminOrder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteAdminOrder,
        onSuccess: async () => {
            toast.success('Order deleted')
            await queryClient.invalidateQueries({ queryKey: ['store', 'admin'] })
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })
}

export const useAdminProducts = () =>
    useQuery({
        queryKey: STORE_KEYS.adminProducts,
        queryFn: getAdminProducts,
    })

export const useCreateAdminProduct = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createAdminProduct,
        onSuccess: async () => {
            toast.success('Product created')
            await queryClient.invalidateQueries({ queryKey: ['store'] })
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })
}

export const useDeleteAdminProduct = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteAdminProduct,
        onSuccess: async () => {
            toast.success('Product deleted')
            await queryClient.invalidateQueries({ queryKey: ['store'] })
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })
}

export const useUpdateAdminProduct = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateAdminProduct,
        onSuccess: async () => {
            toast.success('Product updated')
            await queryClient.invalidateQueries({ queryKey: ['store'] })
        },
        onError: (error) => {
            toast.error(getErrorMessage(error))
        },
    })
}
