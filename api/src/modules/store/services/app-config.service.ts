import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/core/databases/prisma/prisma.service'
import { APP_CONFIG_ID, STORE_DEFAULT_POINTS_PER_CURRENCY_UNIT } from '../constants/store.constants'
import { AppConfigEntry } from '../interfaces/store.interface'

@Injectable()
export class AppConfigService {
    constructor(private readonly prisma: PrismaService) { }

    async getPointsPerCurrencyUnit(): Promise<number> {
        const config = await this.prisma.appConfig.findUnique({ where: { id: APP_CONFIG_ID } })

        return config?.points_per_currency_unit ?? STORE_DEFAULT_POINTS_PER_CURRENCY_UNIT
    }

    async getConfig(): Promise<AppConfigEntry> {
        return { points_per_currency_unit: await this.getPointsPerCurrencyUnit() }
    }

    async updateConfig(pointsPerCurrencyUnit: number): Promise<AppConfigEntry> {
        const config = await this.prisma.appConfig.upsert({
            where: { id: APP_CONFIG_ID },
            create: { id: APP_CONFIG_ID, points_per_currency_unit: pointsPerCurrencyUnit },
            update: { points_per_currency_unit: pointsPerCurrencyUnit },
        })

        return { points_per_currency_unit: config.points_per_currency_unit }
    }
}
