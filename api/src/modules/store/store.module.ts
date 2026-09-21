import { Module } from '@nestjs/common'
import { PrismaModule } from '@/core/databases/prisma/prisma.module'
import { GcsIntegrationModule } from '@/integrations/storage/gcs/gcs.module'
import { StripeIntegrationModule } from '@/integrations/stripe/stripe.module'
import { StoreController } from './controllers/store.controller'
import { StoreAdminController } from './controllers/store-admin.controller'
import { StoreWebhookController } from './controllers/store-webhook.controller'
import { ProductsService } from './services/products.service'
import { OrdersService } from './services/orders.service'
import { PurchaseService } from './services/purchase.service'

@Module({
    imports: [PrismaModule, GcsIntegrationModule, StripeIntegrationModule],
    controllers: [StoreController, StoreAdminController, StoreWebhookController],
    providers: [ProductsService, OrdersService, PurchaseService],
})
export class StoreModule { }
