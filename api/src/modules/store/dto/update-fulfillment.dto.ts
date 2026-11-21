import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { FulfillmentStatus } from 'generated/prisma'

export class UpdateFulfillmentDto {
    @ApiProperty({ enum: FulfillmentStatus, example: FulfillmentStatus.shipped })
    @IsEnum(FulfillmentStatus)
    status: FulfillmentStatus
}
