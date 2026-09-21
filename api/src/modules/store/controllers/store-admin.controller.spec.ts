import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as request from 'supertest'
import { PrismaService } from '@/core/databases/prisma/prisma.service'
import { GcsService } from '@/integrations/storage/gcs/services/gcs.service'
import { JwtGuard } from '@/shared/guards/jwt.guard'
import { RolesGuard } from '@/shared/guards/roles.guard'
import { OrdersService } from '../services/orders.service'
import { ProductsService } from '../services/products.service'
import { StoreAdminController } from './store-admin.controller'

describe('StoreAdminController product creation', () => {
    let app: INestApplication
    const productCreate = jest.fn()
    const productFindUnique = jest.fn()
    const productUpdate = jest.fn()
    const productDelete = jest.fn()
    const orderCount = jest.fn()
    const uploadImageFromBuffer = jest.fn()
    const deleteImage = jest.fn()
    const getSignedUrl = jest.fn()

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [StoreAdminController],
            providers: [
                ProductsService,
                { provide: OrdersService, useValue: {} },
                {
                    provide: PrismaService,
                    useValue: {
                        product: { create: productCreate, findUnique: productFindUnique, update: productUpdate, delete: productDelete },
                        order: { count: orderCount },
                    },
                },
                { provide: GcsService, useValue: { uploadImageFromBuffer, deleteImage, getSignedUrl } },
            ],
        })
            .overrideGuard(JwtGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile()

        app = moduleRef.createNestApplication()
        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
                transformOptions: { enableImplicitConversion: true },
            }),
        )
        await app.init()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(() => {
        jest.resetAllMocks()
        getSignedUrl.mockResolvedValue('https://signed.example/image')
        uploadImageFromBuffer.mockImplementation(async (_buffer: Buffer, filename: string, contentType: string, folder: string) => ({
            url: 'https://storage.example/x',
            filename,
            size: 3,
            contentType,
            bucket: 'bucket',
            path: `${folder}/1-${filename}`,
        }))
        productCreate.mockImplementation(async ({ data }) => ({
            id: 1,
            uuid: data.uuid,
            name: data.name,
            description: data.description,
            type: data.type,
            payment_method: data.payment_method,
            price: data.price,
            image_path: data.image_path,
            created_at: new Date('2026-01-01T00:00:00Z'),
            updated_at: new Date('2026-01-01T00:00:00Z'),
            files: data.files.create.map((file: { name: string; size: number; content_type: string }, index: number) => ({
                id: index,
                uuid: `file-${index}`,
                product_uuid: data.uuid,
                created_at: new Date('2026-01-01T00:00:00Z'),
                path: 'secret/path',
                ...file,
            })),
            images: (data.images?.create ?? []).map((image: { path: string }, index: number) => ({
                id: index,
                uuid: `image-${index}`,
                product_uuid: data.uuid,
                created_at: new Date('2026-01-01T00:00:00Z'),
                ...image,
            })),
        }))
    })

    it('creates one product holding every uploaded file', async () => {
        const response = await request(app.getHttpServer())
            .post('/store/admin/products')
            .field('name', 'Opening Playbook')
            .field('description', 'Guide')
            .field('type', 'digital')
            .field('payment_method', 'points')
            .field('price', '250')
            .attach('files', Buffer.from('abc'), 'guide.pdf')
            .attach('files', Buffer.from('def'), 'cheatsheet.png')

        expect(response.status).toBe(HttpStatus.CREATED)
        expect(response.body.price).toBe(250)
        expect(response.body.files.map((file: { name: string }) => file.name)).toEqual(['guide.pdf', 'cheatsheet.png'])
        expect(JSON.stringify(response.body)).not.toContain('secret/path')
        expect(uploadImageFromBuffer).toHaveBeenCalledTimes(2)
        expect(productCreate).toHaveBeenCalledTimes(1)
    })

    it('stores a cover image separately from the product files and returns its signed URL', async () => {
        const response = await request(app.getHttpServer())
            .post('/store/admin/products')
            .field('name', 'With cover')
            .field('description', '')
            .field('type', 'digital')
            .field('payment_method', 'points')
            .field('price', '10')
            .attach('files', Buffer.from('abc'), 'guide.pdf')
            .attach('image', Buffer.from('img'), { filename: 'cover.png', contentType: 'image/png' })

        expect(response.status).toBe(HttpStatus.CREATED)
        expect(response.body.image_url).toBe('https://signed.example/image')
        expect(response.body.files).toHaveLength(1)
        expect(productCreate.mock.calls[0][0].data.image_path).toContain('/image/')
        expect(uploadImageFromBuffer).toHaveBeenCalledTimes(2)
    })

    it('rejects a cover image that is not an image and uploads nothing', async () => {
        const response = await request(app.getHttpServer())
            .post('/store/admin/products')
            .field('name', 'Bad cover')
            .field('description', '')
            .field('type', 'digital')
            .field('payment_method', 'points')
            .field('price', '10')
            .attach('files', Buffer.from('abc'), 'guide.pdf')
            .attach('image', Buffer.from('nope'), { filename: 'cover.pdf', contentType: 'application/pdf' })

        expect(response.status).toBe(HttpStatus.BAD_REQUEST)
        expect(uploadImageFromBuffer).not.toHaveBeenCalled()
    })

    it('returns a null image_url for a product without a cover', async () => {
        const response = await request(app.getHttpServer())
            .post('/store/admin/products')
            .field('name', 'No cover')
            .field('description', '')
            .field('type', 'digital')
            .field('payment_method', 'points')
            .field('price', '10')
            .attach('files', Buffer.from('abc'), 'guide.pdf')

        expect(response.body.image_url).toBeNull()
        expect(getSignedUrl).not.toHaveBeenCalled()
    })

    it('rejects a digital product without files and uploads nothing', async () => {
        const response = await request(app.getHttpServer())
            .post('/store/admin/products')
            .field('name', 'Empty')
            .field('description', '')
            .field('type', 'digital')
            .field('payment_method', 'points')
            .field('price', '10')

        expect(response.status).toBe(HttpStatus.BAD_REQUEST)
        expect(uploadImageFromBuffer).not.toHaveBeenCalled()
        expect(productCreate).not.toHaveBeenCalled()
    })

    it('rejects an unknown product type', async () => {
        const response = await request(app.getHttpServer())
            .post('/store/admin/products')
            .field('name', 'Bad type')
            .field('description', '')
            .field('type', 'subscription')
            .field('payment_method', 'points')
            .field('price', '10')
            .attach('files', Buffer.from('abc'), 'a.pdf')

        expect(response.status).toBe(HttpStatus.BAD_REQUEST)
        expect(productCreate).not.toHaveBeenCalled()
    })

    it('rejects an online price below the Stripe minimum', async () => {
        const response = await request(app.getHttpServer())
            .post('/store/admin/products')
            .field('name', 'Cheap')
            .field('description', '')
            .field('type', 'digital')
            .field('payment_method', 'online')
            .field('price', '10')
            .attach('files', Buffer.from('abc'), 'a.pdf')

        expect(response.status).toBe(HttpStatus.BAD_REQUEST)
        expect(uploadImageFromBuffer).not.toHaveBeenCalled()
    })

    it('cleans up uploaded files when the database write fails', async () => {
        productCreate.mockRejectedValueOnce(new Error('db down'))
        deleteImage.mockResolvedValue({ success: true })

        const response = await request(app.getHttpServer())
            .post('/store/admin/products')
            .field('name', 'Doomed')
            .field('description', '')
            .field('type', 'digital')
            .field('payment_method', 'points')
            .field('price', '10')
            .attach('files', Buffer.from('abc'), 'a.pdf')

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
        expect(deleteImage).toHaveBeenCalledTimes(1)
    })

    describe('product update', () => {
        const productUuid = '11111111-1111-4111-8111-111111111111'
        const keptFileUuid = '22222222-2222-4222-8222-222222222222'
        const removedFileUuid = '33333333-3333-4333-8333-333333333333'
        const keptImageUuid = '55555555-5555-4555-8555-555555555555'
        const removedImageUuid = '66666666-6666-4666-8666-666666666666'
        const existingFile = (uuid: string, name: string) => ({
            id: 1,
            uuid,
            product_uuid: productUuid,
            name,
            path: `store-products/${productUuid}/${name}`,
            size: 3,
            content_type: 'application/pdf',
            created_at: new Date('2026-01-01T00:00:00Z'),
        })
        const existingProduct = {
            id: 1,
            uuid: productUuid,
            name: 'Old',
            description: '',
            type: 'digital',
            payment_method: 'points',
            price: 100,
            image_path: 'store-products/old/image/0-old.png',
            created_at: new Date('2026-01-01T00:00:00Z'),
            updated_at: new Date('2026-01-01T00:00:00Z'),
            files: [existingFile(keptFileUuid, 'kept.pdf'), existingFile(removedFileUuid, 'removed.pdf')],
            images: [
                { id: 1, uuid: keptImageUuid, product_uuid: productUuid, path: 'store-products/old/gallery/0-kept.png', created_at: new Date('2026-01-01T00:00:00Z') },
                { id: 2, uuid: removedImageUuid, product_uuid: productUuid, path: 'store-products/old/gallery/1-removed.png', created_at: new Date('2026-01-01T00:00:00Z') },
            ],
        }

        beforeEach(() => {
            productFindUnique.mockResolvedValue(existingProduct)
            productUpdate.mockImplementation(async ({ data }) => ({
                ...existingProduct,
                ...data,
                files: [existingProduct.files[0]],
                images: [existingProduct.images[0]],
            }))
            deleteImage.mockResolvedValue({ success: true })
        })

        it('updates fields, removes a file and deletes it from storage', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/store/admin/products/${productUuid}`)
                .field('name', 'New name')
                .field('description', 'Updated')
                .field('type', 'digital')
                .field('payment_method', 'points')
                .field('price', '300')
                .field('remove_file_uuids', removedFileUuid)

            expect(response.status).toBe(HttpStatus.OK)
            expect(response.body.name).toBe('New name')
            expect(response.body.price).toBe(300)
            expect(productUpdate.mock.calls[0][0].data.files.deleteMany).toEqual({ uuid: { in: [removedFileUuid] } })
            expect(deleteImage).toHaveBeenCalledWith({ filename: existingProduct.files[1].path })
        })

        it('replaces the cover image and deletes the previous one from storage', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/store/admin/products/${productUuid}`)
                .field('name', 'Old')
                .field('description', '')
                .field('type', 'digital')
                .field('payment_method', 'points')
                .field('price', '100')
                .attach('image', Buffer.from('img'), { filename: 'new.png', contentType: 'image/png' })

            expect(response.status).toBe(HttpStatus.OK)
            expect(productUpdate.mock.calls[0][0].data.image_path).toContain('/image/')
            expect(deleteImage).toHaveBeenCalledWith({ filename: 'store-products/old/image/0-old.png' })
        })

        it('removes the cover image when asked', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/store/admin/products/${productUuid}`)
                .field('name', 'Old')
                .field('description', '')
                .field('type', 'digital')
                .field('payment_method', 'points')
                .field('price', '100')
                .field('remove_image', 'true')

            expect(response.status).toBe(HttpStatus.OK)
            expect(productUpdate.mock.calls[0][0].data.image_path).toBeNull()
            expect(deleteImage).toHaveBeenCalledWith({ filename: 'store-products/old/image/0-old.png' })
        })

        it('keeps the cover image when neither replaced nor removed', async () => {
            await request(app.getHttpServer())
                .patch(`/store/admin/products/${productUuid}`)
                .field('name', 'Old')
                .field('description', '')
                .field('type', 'digital')
                .field('payment_method', 'points')
                .field('price', '100')

            expect(productUpdate.mock.calls[0][0].data.image_path).toBeUndefined()
            expect(deleteImage).not.toHaveBeenCalled()
        })

        it('returns 404 for an unknown product', async () => {
            productFindUnique.mockResolvedValue(null)

            const response = await request(app.getHttpServer())
                .patch(`/store/admin/products/${productUuid}`)
                .field('name', 'Ghost')
                .field('description', '')
                .field('type', 'digital')
                .field('payment_method', 'points')
                .field('price', '10')

            expect(response.status).toBe(HttpStatus.NOT_FOUND)
            expect(productUpdate).not.toHaveBeenCalled()
        })

        it('rejects removing every file of a digital product', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/store/admin/products/${productUuid}`)
                .field('name', 'Empty')
                .field('description', '')
                .field('type', 'digital')
                .field('payment_method', 'points')
                .field('price', '10')
                .field('remove_file_uuids', keptFileUuid)
                .field('remove_file_uuids', removedFileUuid)

            expect(response.status).toBe(HttpStatus.BAD_REQUEST)
            expect(productUpdate).not.toHaveBeenCalled()
        })

        it('rejects removing a file that belongs to another product', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/store/admin/products/${productUuid}`)
                .field('name', 'Sneaky')
                .field('description', '')
                .field('type', 'digital')
                .field('payment_method', 'points')
                .field('price', '10')
                .field('remove_file_uuids', '44444444-4444-4444-8444-444444444444')

            expect(response.status).toBe(HttpStatus.BAD_REQUEST)
            expect(productUpdate).not.toHaveBeenCalled()
        })

        it('adds gallery images, removes one and deletes it from storage', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/store/admin/products/${productUuid}`)
                .field('name', 'Gallery')
                .field('description', '')
                .field('type', 'digital')
                .field('payment_method', 'points')
                .field('price', '10')
                .field('remove_gallery_uuids', removedImageUuid)
                .attach('gallery', Buffer.from('img'), { filename: 'extra.png', contentType: 'image/png' })

            expect(response.status).toBe(HttpStatus.OK)
            expect(productUpdate.mock.calls[0][0].data.images.deleteMany).toEqual({ uuid: { in: [removedImageUuid] } })
            expect(productUpdate.mock.calls[0][0].data.images.create).toHaveLength(1)
            expect(deleteImage).toHaveBeenCalledWith({ filename: 'store-products/old/gallery/1-removed.png' })
        })

        it('rejects removing a gallery image that belongs to another product', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/store/admin/products/${productUuid}`)
                .field('name', 'Sneaky')
                .field('description', '')
                .field('type', 'digital')
                .field('payment_method', 'points')
                .field('price', '10')
                .field('remove_gallery_uuids', '44444444-4444-4444-8444-444444444444')

            expect(response.status).toBe(HttpStatus.BAD_REQUEST)
            expect(productUpdate).not.toHaveBeenCalled()
        })

        it('rejects a gallery image that is not an image', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/store/admin/products/${productUuid}`)
                .field('name', 'Bad gallery')
                .field('description', '')
                .field('type', 'digital')
                .field('payment_method', 'points')
                .field('price', '10')
                .attach('gallery', Buffer.from('nope'), { filename: 'x.pdf', contentType: 'application/pdf' })

            expect(response.status).toBe(HttpStatus.BAD_REQUEST)
            expect(uploadImageFromBuffer).not.toHaveBeenCalled()
        })

        describe('delete', () => {
            it('deletes a product without orders and removes its stored files', async () => {
                orderCount.mockResolvedValue(0)
                productDelete.mockResolvedValue(undefined)
                deleteImage.mockResolvedValue({ success: true })

                const response = await request(app.getHttpServer()).delete(`/store/admin/products/${productUuid}`)

                expect(response.status).toBe(HttpStatus.OK)
                expect(productDelete).toHaveBeenCalledWith({ where: { uuid: productUuid } })
                expect(deleteImage).toHaveBeenCalledTimes(5)
            })

            it('refuses to delete a product that has orders', async () => {
                orderCount.mockResolvedValue(2)

                const response = await request(app.getHttpServer()).delete(`/store/admin/products/${productUuid}`)

                expect(response.status).toBe(HttpStatus.CONFLICT)
                expect(productDelete).not.toHaveBeenCalled()
                expect(deleteImage).not.toHaveBeenCalled()
            })

            it('returns 404 for an unknown product', async () => {
                productFindUnique.mockResolvedValue(null)

                const response = await request(app.getHttpServer()).delete(`/store/admin/products/${productUuid}`)

                expect(response.status).toBe(HttpStatus.NOT_FOUND)
                expect(productDelete).not.toHaveBeenCalled()
            })
        })
    })
})
