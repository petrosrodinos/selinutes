import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, Min, ValidateNested } from 'class-validator'
import { ShippingAddressDto } from './shipping-address.dto'

export class PurchaseProductDto {
    @ApiPropertyOptional({ example: 150, minimum: 0, description: 'In-game points to apply as a discount (0 or omitted for none)' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    points?: number

    @ApiPropertyOptional({ type: ShippingAddressDto, description: 'Delivery details, required for physical products' })
    @IsOptional()
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    shipping?: ShippingAddressDto
}
