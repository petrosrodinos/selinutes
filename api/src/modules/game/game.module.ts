import { Module } from '@nestjs/common'
import { GameController } from './game.controller'
import { GameService } from './game.service'
import { AppCacheModule } from '@/shared/services/cache/cache.module'

@Module({
    imports: [AppCacheModule],
    controllers: [GameController],
    providers: [GameService],
    exports: [GameService]
})
export class GameModule { }
