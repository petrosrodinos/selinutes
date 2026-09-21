import { BadGatewayException, BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { posix } from 'path'
import { OrderStatus } from 'generated/prisma'
import { PrismaService } from '@/core/databases/prisma/prisma.service'
import { GcsService } from '@/integrations/storage/gcs/services/gcs.service'
import { CreateProductDto } from '../dto/create-product.dto'
import { UpdateProductDto } from '../dto/update-product.dto'
import { PRODUCT_INCLUDE, ProductWithFiles } from '../constants/store-queries.constants'
import { STORE_GCS_FOLDER, STORE_IMAGE_URL_EXPIRY_MINUTES } from '../constants/store.constants'
import { ProductEntry, ProductGalleryImageEntry, StoreProductEntry } from '../interfaces/store.interface'
import {
    decodeUploadedFileName,
    getProductFilesError,
    getProductGalleryError,
    getProductImageError,
    getProductPricingError,
    sanitizeFileName,
    toProductEntry,
    toStoreProductEntry,
} from '../helpers/store.helper'

interface UploadedProductFile {
    name: string
    path: string
    size: number
    content_type: string
}

interface UploadedProductAssets {
    files: UploadedProductFile[]
    image?: UploadedProductFile
    gallery: UploadedProductFile[]
}

export interface ProductUploads {
    files: Express.Multer.File[]
    image?: Express.Multer.File
    gallery: Express.Multer.File[]
}

const getUploadedPaths = (assets: UploadedProductAssets): string[] => [
    ...assets.files.map((file) => file.path),
    ...(assets.image ? [assets.image.path] : []),
    ...assets.gallery.map((image) => image.path),
]

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly gcsService: GcsService,
    ) { }

    async listProducts(): Promise<ProductEntry[]> {
        const products = await this.prisma.product.findMany({
            include: PRODUCT_INCLUDE,
            orderBy: { created_at: 'desc' },
        })

        return Promise.all(products.map((product) => this.toEntry(product)))
    }

    async listStoreProducts(userUuid: string): Promise<StoreProductEntry[]> {
        const [products, paidOrders] = await Promise.all([
            this.prisma.product.findMany({
                include: PRODUCT_INCLUDE,
                orderBy: { created_at: 'desc' },
            }),
            this.prisma.order.findMany({
                where: { user_uuid: userUuid, status: OrderStatus.paid },
                select: { product_uuid: true },
            }),
        ])

        const purchasedProductUuids = new Set(paidOrders.map((order) => order.product_uuid))

        return Promise.all(
            products.map(async (product) => toStoreProductEntry(await this.toEntry(product), purchasedProductUuids.has(product.uuid))),
        )
    }

    async getStoreProduct(userUuid: string, productUuid: string): Promise<StoreProductEntry> {
        const [product, paidOrder] = await Promise.all([
            this.prisma.product.findUnique({ where: { uuid: productUuid }, include: PRODUCT_INCLUDE }),
            this.prisma.order.findFirst({
                where: { user_uuid: userUuid, product_uuid: productUuid, status: OrderStatus.paid },
                select: { id: true },
            }),
        ])

        if (!product) {
            throw new NotFoundException('Product not found')
        }

        return toStoreProductEntry(await this.toEntry(product), paidOrder !== null)
    }

    async createProduct(dto: CreateProductDto, uploads: ProductUploads): Promise<ProductEntry> {
        const validationError =
            getProductPricingError(dto.payment_method, dto.price) ??
            getProductFilesError(dto.type, uploads.files.length) ??
            (uploads.image ? getProductImageError(uploads.image) : null) ??
            getProductGalleryError(uploads.gallery, uploads.gallery.length)

        if (validationError) {
            throw new BadRequestException(validationError)
        }

        const productUuid = randomUUID()
        const uploaded = await this.uploadProductAssets(productUuid, uploads)

        try {
            const product = await this.prisma.product.create({
                data: {
                    uuid: productUuid,
                    name: dto.name,
                    description: dto.description,
                    type: dto.type,
                    payment_method: dto.payment_method,
                    price: dto.price,
                    image_path: uploaded.image?.path ?? null,
                    files: { create: uploaded.files },
                    images: { create: uploaded.gallery.map((image) => ({ path: image.path })) },
                },
                include: PRODUCT_INCLUDE,
            })

            this.logger.log(
                `Product ${product.uuid} created (${product.type}, ${product.payment_method}, ${uploaded.files.length} files, ${uploaded.gallery.length} gallery images)`,
            )

            return await this.toEntry(product)
        } catch (error) {
            await this.deleteStoredFiles(getUploadedPaths(uploaded))
            throw error
        }
    }

    async updateProduct(productUuid: string, dto: UpdateProductDto, uploads: ProductUploads): Promise<ProductEntry> {
        const existing = await this.prisma.product.findUnique({
            where: { uuid: productUuid },
            include: PRODUCT_INCLUDE,
        })

        if (!existing) {
            throw new NotFoundException('Product not found')
        }

        const existingFileUuids = new Set(existing.files.map((file) => file.uuid))

        if (dto.remove_file_uuids.some((fileUuid) => !existingFileUuids.has(fileUuid))) {
            throw new BadRequestException('Cannot remove a file that does not belong to this product')
        }

        const existingGalleryUuids = new Set(existing.images.map((image) => image.uuid))

        if (dto.remove_gallery_uuids.some((imageUuid) => !existingGalleryUuids.has(imageUuid))) {
            throw new BadRequestException('Cannot remove a gallery image that does not belong to this product')
        }

        const removedFileUuids = new Set(dto.remove_file_uuids)
        const removedFiles = existing.files.filter((file) => removedFileUuids.has(file.uuid))
        const finalFileCount = existing.files.length - removedFiles.length + uploads.files.length

        const removedGalleryUuids = new Set(dto.remove_gallery_uuids)
        const removedGallery = existing.images.filter((image) => removedGalleryUuids.has(image.uuid))
        const finalGalleryCount = existing.images.length - removedGallery.length + uploads.gallery.length

        const validationError =
            getProductPricingError(dto.payment_method, dto.price) ??
            getProductFilesError(dto.type, finalFileCount) ??
            (uploads.image ? getProductImageError(uploads.image) : null) ??
            getProductGalleryError(uploads.gallery, finalGalleryCount)

        if (validationError) {
            throw new BadRequestException(validationError)
        }

        const uploaded = await this.uploadProductAssets(productUuid, uploads)
        const replacesImage = uploaded.image !== undefined || dto.remove_image
        const nextImagePath = uploaded.image?.path ?? (dto.remove_image ? null : undefined)

        try {
            const product = await this.prisma.product.update({
                where: { uuid: productUuid },
                data: {
                    name: dto.name,
                    description: dto.description,
                    type: dto.type,
                    payment_method: dto.payment_method,
                    price: dto.price,
                    image_path: nextImagePath,
                    files: {
                        deleteMany: { uuid: { in: removedFiles.map((file) => file.uuid) } },
                        create: uploaded.files,
                    },
                    images: {
                        deleteMany: { uuid: { in: removedGallery.map((image) => image.uuid) } },
                        create: uploaded.gallery.map((image) => ({ path: image.path })),
                    },
                },
                include: PRODUCT_INCLUDE,
            })

            const obsoletePaths = [
                ...removedFiles.map((file) => file.path),
                ...removedGallery.map((image) => image.path),
                ...(replacesImage && existing.image_path ? [existing.image_path] : []),
            ]
            await this.deleteStoredFiles(obsoletePaths)

            this.logger.log(
                `Product ${product.uuid} updated (${product.type}, ${product.payment_method}, files +${uploaded.files.length}/-${removedFiles.length}, gallery +${uploaded.gallery.length}/-${removedGallery.length})`,
            )

            return await this.toEntry(product)
        } catch (error) {
            await this.deleteStoredFiles(getUploadedPaths(uploaded))
            throw error
        }
    }

    async deleteProduct(productUuid: string): Promise<{ message: string }> {
        const existing = await this.prisma.product.findUnique({
            where: { uuid: productUuid },
            include: PRODUCT_INCLUDE,
        })

        if (!existing) {
            throw new NotFoundException('Product not found')
        }

        const orderCount = await this.prisma.order.count({ where: { product_uuid: productUuid } })

        if (orderCount > 0) {
            throw new ConflictException('This product has orders and cannot be deleted. Delete its orders first.')
        }

        await this.prisma.product.delete({ where: { uuid: productUuid } })

        await this.deleteStoredFiles([
            ...existing.files.map((file) => file.path),
            ...existing.images.map((image) => image.path),
            ...(existing.image_path ? [existing.image_path] : []),
        ])

        this.logger.log(`Product ${productUuid} deleted`)

        return { message: 'Product deleted successfully' }
    }

    private async toEntry(product: ProductWithFiles): Promise<ProductEntry> {
        const [imageUrl, galleryUrls] = await Promise.all([
            product.image_path ? this.getSignedImageUrl(product.uuid, product.image_path) : null,
            Promise.all(product.images.map((image) => this.getSignedImageUrl(product.uuid, image.path))),
        ])

        const gallery = product.images.flatMap((image, index): ProductGalleryImageEntry[] => {
            const url = galleryUrls[index]
            return url ? [{ uuid: image.uuid, url }] : []
        })

        return toProductEntry(product, imageUrl, gallery)
    }

    private async getSignedImageUrl(productUuid: string, path: string): Promise<string | null> {
        try {
            return await this.gcsService.getSignedUrl(posix.basename(path), posix.dirname(path), STORE_IMAGE_URL_EXPIRY_MINUTES)
        } catch {
            this.logger.error(`Failed to sign image URL for product ${productUuid}`)
            return null
        }
    }

    private async uploadProductAssets(productUuid: string, uploads: ProductUploads): Promise<UploadedProductAssets> {
        const folder = `${STORE_GCS_FOLDER}/${productUuid}`
        const uploaded: UploadedProductAssets = { files: [], gallery: [] }

        try {
            uploaded.files = await this.uploadFiles(productUuid, folder, uploads.files)

            if (uploads.image) {
                ;[uploaded.image] = await this.uploadFiles(productUuid, `${folder}/image`, [uploads.image])
            }

            uploaded.gallery = await this.uploadFiles(productUuid, `${folder}/gallery`, uploads.gallery)

            return uploaded
        } catch (error) {
            await this.deleteStoredFiles(getUploadedPaths(uploaded))
            throw error
        }
    }

    private async uploadFiles(productUuid: string, folder: string, files: Express.Multer.File[]): Promise<UploadedProductFile[]> {
        const uploadResults = await Promise.allSettled(
            files.map((file, index) =>
                this.gcsService.uploadImageFromBuffer(
                    file.buffer,
                    `${index}-${sanitizeFileName(decodeUploadedFileName(file.originalname))}`,
                    file.mimetype,
                    folder,
                ),
            ),
        )

        const uploaded = uploadResults.flatMap((result, index) =>
            result.status === 'fulfilled'
                ? [
                    {
                        name: decodeUploadedFileName(files[index].originalname),
                        path: result.value.path,
                        size: result.value.size,
                        content_type: result.value.contentType,
                    },
                ]
                : [],
        )

        if (uploaded.length !== files.length) {
            await this.deleteStoredFiles(uploaded.map((file) => file.path))
            const reasons = uploadResults.flatMap((result) =>
                result.status === 'rejected' ? [result.reason instanceof Error ? result.reason.message : String(result.reason)] : [],
            )
            this.logger.error(`Product file upload failed for product ${productUuid}: ${reasons.join('; ')}`)
            throw new BadGatewayException('Failed to upload product files')
        }

        return uploaded
    }

    private async deleteStoredFiles(paths: string[]): Promise<void> {
        await Promise.allSettled(paths.map((path) => this.gcsService.deleteImage({ filename: path })))
    }
}
