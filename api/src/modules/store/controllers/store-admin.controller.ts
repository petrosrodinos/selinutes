import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { JwtGuard } from '@/shared/guards/jwt.guard'
import { RolesGuard } from '@/shared/guards/roles.guard'
import { Roles } from '@/shared/decorators/roles.decorator'
import { AuthRoles } from '@/modules/auth/interfaces/auth.interface'
import { CreateProductDto } from '../dto/create-product.dto'
import { UpdateProductDto } from '../dto/update-product.dto'
import {
    STORE_FILES_FIELD,
    STORE_GALLERY_FIELD,
    STORE_IMAGE_FIELD,
    STORE_MAX_FILE_SIZE_BYTES,
    STORE_MAX_GALLERY_IMAGES,
    STORE_MAX_PRODUCT_FILES,
} from '../constants/store.constants'
import { AdminOrderEntry, ProductEntry, StoreOverviewEntry } from '../interfaces/store.interface'
import { ProductUploads, ProductsService } from '../services/products.service'
import { OrdersService } from '../services/orders.service'

interface ProductUploadFields {
    [STORE_FILES_FIELD]?: Express.Multer.File[]
    [STORE_IMAGE_FIELD]?: Express.Multer.File[]
    [STORE_GALLERY_FIELD]?: Express.Multer.File[]
}

const productUploadInterceptor = FileFieldsInterceptor(
    [
        { name: STORE_FILES_FIELD, maxCount: STORE_MAX_PRODUCT_FILES },
        { name: STORE_IMAGE_FIELD, maxCount: 1 },
        { name: STORE_GALLERY_FIELD, maxCount: STORE_MAX_GALLERY_IMAGES },
    ],
    {
        storage: memoryStorage(),
        limits: { fileSize: STORE_MAX_FILE_SIZE_BYTES },
    },
)

const toProductUploads = (uploads: ProductUploadFields | undefined): ProductUploads => ({
    files: uploads?.[STORE_FILES_FIELD] ?? [],
    image: uploads?.[STORE_IMAGE_FIELD]?.[0],
    gallery: uploads?.[STORE_GALLERY_FIELD] ?? [],
})

@ApiTags('Store Admin')
@ApiBearerAuth()
@Controller('store/admin')
@UseGuards(JwtGuard, RolesGuard)
@Roles(AuthRoles.ADMIN)
export class StoreAdminController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly ordersService: OrdersService,
    ) { }

    @Get('overview')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin: get store overview numbers' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Overview retrieved successfully' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    getOverview(): Promise<StoreOverviewEntry> {
        return this.ordersService.getOverview()
    }

    @Get('orders')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin: list all orders' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Orders retrieved successfully' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    getOrders(): Promise<AdminOrderEntry[]> {
        return this.ordersService.getAdminOrders()
    }

    @Get('orders/:orderUuid')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin: get order details' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Order retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    getOrder(@Param('orderUuid', ParseUUIDPipe) orderUuid: string): Promise<AdminOrderEntry> {
        return this.ordersService.getAdminOrder(orderUuid)
    }

    @Patch('orders/:orderUuid/cancel')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin: cancel an order and refund points for points orders' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Order cancelled successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Order already cancelled' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    cancelOrder(@Param('orderUuid', ParseUUIDPipe) orderUuid: string): Promise<AdminOrderEntry> {
        return this.ordersService.cancelOrder(orderUuid)
    }

    @Delete('orders/:orderUuid')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin: delete an order' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Order deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    deleteOrder(@Param('orderUuid', ParseUUIDPipe) orderUuid: string): Promise<{ message: string }> {
        return this.ordersService.deleteOrder(orderUuid)
    }

    @Get('products')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin: list all products' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Products retrieved successfully' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    getProducts(): Promise<ProductEntry[]> {
        return this.productsService.listProducts()
    }

    @Post('products')
    @HttpCode(HttpStatus.CREATED)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(productUploadInterceptor)
    @ApiOperation({ summary: 'Admin: create a product with optional files' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Product created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid product data' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    createProduct(
        @Body() dto: CreateProductDto,
        @UploadedFiles() uploads: ProductUploadFields,
    ): Promise<ProductEntry> {
        return this.productsService.createProduct(dto, toProductUploads(uploads))
    }

    @Patch('products/:productUuid')
    @HttpCode(HttpStatus.OK)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(productUploadInterceptor)
    @ApiOperation({ summary: 'Admin: update a product, add new files and remove existing ones' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Product updated successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid product data' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    updateProduct(
        @Param('productUuid', ParseUUIDPipe) productUuid: string,
        @Body() dto: UpdateProductDto,
        @UploadedFiles() uploads: ProductUploadFields,
    ): Promise<ProductEntry> {
        return this.productsService.updateProduct(productUuid, dto, toProductUploads(uploads))
    }

    @Delete('products/:productUuid')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin: delete a product and its stored files' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Product deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Product has orders' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    deleteProduct(@Param('productUuid', ParseUUIDPipe) productUuid: string): Promise<{ message: string }> {
        return this.productsService.deleteProduct(productUuid)
    }
}
