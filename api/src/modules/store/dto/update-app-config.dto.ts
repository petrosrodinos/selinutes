import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, Max, Min } from 'class-validator'
import { STORE_MAX_POINTS_PER_CURRENCY_UNIT } from '../constants/store.constants'

export class UpdateAppConfigDto {
    @ApiProperty({ example: 100, minimum: 1, description: 'How many points are worth 1 EUR in the store' })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(STORE_MAX_POINTS_PER_CURRENCY_UNIT)
    points_per_currency_unit: number
}
