import { BadRequestException, Controller, Headers, HttpCode, HttpStatus, Post, RawBodyRequest, Req } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { PurchaseService } from '../services/purchase.service'

@ApiTags('Store Webhooks')
@Controller('store/webhooks')
export class StoreWebhookController {
    constructor(private readonly purchaseService: PurchaseService) { }

    @Post('stripe')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Stripe webhook receiver for store orders' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Webhook processed' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid signature' })
    handleStripeWebhook(
        @Req() request: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ): Promise<{ received: true }> {
        if (!request.rawBody || !signature) {
            throw new BadRequestException('Missing webhook payload or signature')
        }

        return this.purchaseService.handleStripeWebhook(request.rawBody, signature)
    }
}
