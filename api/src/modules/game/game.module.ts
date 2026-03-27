import { Module } from '@nestjs/common'
import { GameController } from './game.controller'
import { GameService } from './game.service'
import { GameGateway } from './game.gateway'
import { AppCacheModule } from '@/shared/services/cache/cache.module'
import { PrismaModule } from '@/core/databases/prisma/prisma.module'

@Module({
    imports: [AppCacheModule, PrismaModule],
    controllers: [GameController],
    providers: [GameService, GameGateway],
    exports: [GameService]
})
export class GameModule { }
