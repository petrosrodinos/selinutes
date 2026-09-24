import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Max, Min, MinLength } from 'class-validator'
import { ProductType } from 'generated/prisma'

export class CreateProductDto {
    @ApiProperty({ example: 'Opening Playbook' })
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    name: string

    @ApiProperty({ example: 'A PDF guide with strategies for the opening phase' })
    @IsString()
    @MaxLength(2000)
    description: string

    @ApiProperty({ enum: ProductType, example: ProductType.digital })
    @IsEnum(ProductType)
    type: ProductType

    @ApiProperty({ example: 500, minimum: 1, description: 'Price in cents, always paid with real money' })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    price: number

    @ApiPropertyOptional({ example: 30, minimum: 0, maximum: 100, description: 'Share of the price (percent) a buyer may pay with in-game points. 0 disables points, 100 allows paying entirely with points' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100)
    max_discount_percent?: number

    @ApiPropertyOptional({ example: 10, minimum: 1, description: 'Available quantity (defaults to 1 on create, unchanged on update)' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity?: number
}
