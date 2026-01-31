import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

@Module({
    imports: [
        CacheModule.register({
            max: 500,
            ttl: 1000 * 60 * 60 * 2,
        }),
    ],
    providers: [CacheService],
    exports: [CacheService],
})
export class AppCacheModule { }
