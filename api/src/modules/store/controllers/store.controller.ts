import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Res, StreamableFile, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from '@/shared/guards/jwt.guard'
import { RolesGuard } from '@/shared/guards/roles.guard'
import { Roles } from '@/shared/decorators/roles.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { AuthRoles } from '@/modules/auth/interfaces/auth.interface'
import { ConfirmCheckoutDto } from '../dto/confirm-checkout.dto'
import { FileDownloadResult, OrderEntry, PurchaseResult, StoreProductEntry } from '../interfaces/store.interface'
import { ProductsService } from '../services/products.service'
import { OrdersService } from '../services/orders.service'
import { PurchaseService } from '../services/purchase.service'

@ApiTags('Store')
@ApiBearerAuth()
@Controller('store')
@UseGuards(JwtGuard, RolesGuard)
@Roles(AuthRoles.USER)
export class StoreController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly ordersService: OrdersService,
        private readonly purchaseService: PurchaseService,
    ) { }

    @Get('products')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'List store products' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Products retrieved successfully' })
    getProducts(@CurrentUser('uuid') userUuid: string): Promise<StoreProductEntry[]> {
        return this.productsService.listStoreProducts(userUuid)
    }

    @Get('products/:productUuid')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a single store product' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Product retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
    getProduct(
        @CurrentUser('uuid') userUuid: string,
        @Param('productUuid', ParseUUIDPipe) productUuid: string,
    ): Promise<StoreProductEntry> {
        return this.productsService.getStoreProduct(userUuid, productUuid)
    }

    @Post('products/:productUuid/purchase')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Purchase a product with points or start an online checkout' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Purchase completed or checkout started' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Not enough points or product not purchasable' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Product already owned' })
    purchase(
        @CurrentUser('uuid') userUuid: string,
        @Param('productUuid', ParseUUIDPipe) productUuid: string,
    ): Promise<PurchaseResult> {
        return this.purchaseService.purchase(userUuid, productUuid)
    }

    @Post('checkout/confirm')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Confirm an online checkout after returning from Stripe' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Order status refreshed' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    confirmCheckout(
        @CurrentUser('uuid') userUuid: string,
        @Body() dto: ConfirmCheckoutDto,
    ): Promise<OrderEntry> {
        return this.purchaseService.confirmCheckout(userUuid, dto.session_id)
    }

    @Get('orders')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'List the current user orders' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Orders retrieved successfully' })
    getMyOrders(@CurrentUser('uuid') userUuid: string): Promise<OrderEntry[]> {
        return this.ordersService.getUserOrders(userUuid)
    }

    @Get('orders/:orderUuid/download')
    @ApiOperation({ summary: 'Download every file and image of a purchased product as a zip' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Zip archive streamed' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    async downloadOrderArchive(
        @CurrentUser('uuid') userUuid: string,
        @Param('orderUuid', ParseUUIDPipe) orderUuid: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        const { stream, filename } = await this.ordersService.getOrderArchive(userUuid, orderUuid)

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        })

        return new StreamableFile(stream)
    }

    @Get('orders/:orderUuid/files/:fileUuid/download')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a temporary download URL for a purchased file' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Download URL created successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order or file not found' })
    getFileDownloadUrl(
        @CurrentUser('uuid') userUuid: string,
        @Param('orderUuid', ParseUUIDPipe) orderUuid: string,
        @Param('fileUuid', ParseUUIDPipe) fileUuid: string,
    ): Promise<FileDownloadResult> {
        return this.ordersService.getFileDownloadUrl(userUuid, orderUuid, fileUuid)
    }
}
