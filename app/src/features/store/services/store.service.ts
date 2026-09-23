import axiosInstance from '../../../config/api/axios'
import { ApiRoutes } from '../../../config/api/routes'
import { buildProductFormData } from '../../../utils/store.utils'
import type {
    AdminOrder,
    CreateProductPayload,
    FileDownloadResult,
    Order,
    Product,
    PurchaseResult,
    StoreOverview,
    StoreProduct,
    UpdateProductPayload,
} from '../interfaces/store.interface'

export const getStoreProducts = async (): Promise<StoreProduct[]> => {
    const response = await axiosInstance.get<StoreProduct[]>(ApiRoutes.store.products)
    return response.data
}

export const getStoreProduct = async (productUuid: string): Promise<StoreProduct> => {
    const response = await axiosInstance.get<StoreProduct>(ApiRoutes.store.product(productUuid))
    return response.data
}

export const purchaseProduct = async (productUuid: string): Promise<PurchaseResult> => {
    const response = await axiosInstance.post<PurchaseResult>(ApiRoutes.store.purchase(productUuid))
    return response.data
}

export const confirmCheckout = async (sessionId: string): Promise<Order> => {
    const response = await axiosInstance.post<Order>(ApiRoutes.store.confirmCheckout, { session_id: sessionId })
    return response.data
}

export const getMyOrders = async (): Promise<Order[]> => {
    const response = await axiosInstance.get<Order[]>(ApiRoutes.store.orders)
    return response.data
}

export const getFileDownloadUrl = async (orderUuid: string, fileUuid: string): Promise<FileDownloadResult> => {
    const response = await axiosInstance.get<FileDownloadResult>(ApiRoutes.store.downloadFile(orderUuid, fileUuid))
    return response.data
}

export const downloadOrderArchive = async (orderUuid: string): Promise<Blob> => {
    const response = await axiosInstance.get<Blob>(ApiRoutes.store.downloadOrder(orderUuid), { responseType: 'blob' })
    return response.data
}

export const getStoreOverview = async (): Promise<StoreOverview> => {
    const response = await axiosInstance.get<StoreOverview>(ApiRoutes.store.admin.overview)
    return response.data
}

export const getAdminOrders = async (): Promise<AdminOrder[]> => {
    const response = await axiosInstance.get<AdminOrder[]>(ApiRoutes.store.admin.orders)
    return response.data
}

export const getAdminOrder = async (orderUuid: string): Promise<AdminOrder> => {
    const response = await axiosInstance.get<AdminOrder>(ApiRoutes.store.admin.order(orderUuid))
    return response.data
}

export const cancelAdminOrder = async (orderUuid: string): Promise<AdminOrder> => {
    const response = await axiosInstance.patch<AdminOrder>(ApiRoutes.store.admin.cancelOrder(orderUuid))
    return response.data
}

export const deleteAdminOrder = async (orderUuid: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>(ApiRoutes.store.admin.order(orderUuid))
    return response.data
}

export const getAdminProducts = async (): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>(ApiRoutes.store.admin.products)
    return response.data
}

export const createAdminProduct = async (payload: CreateProductPayload): Promise<Product> => {
    const response = await axiosInstance.post<Product>(ApiRoutes.store.admin.products, buildProductFormData(payload), {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
}

export const deleteAdminProduct = async (productUuid: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>(ApiRoutes.store.admin.product(productUuid))
    return response.data
}

export const updateAdminProduct = async ({
    productUuid,
    payload,
}: {
    productUuid: string
    payload: UpdateProductPayload
}): Promise<Product> => {
    const response = await axiosInstance.patch<Product>(ApiRoutes.store.admin.product(productUuid), buildProductFormData(payload), {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
}
