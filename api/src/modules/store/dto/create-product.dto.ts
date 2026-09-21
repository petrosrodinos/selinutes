import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator'
import { PaymentMethod, ProductType } from 'generated/prisma'

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

    @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.points })
    @IsEnum(PaymentMethod)
    payment_method: PaymentMethod

    @ApiProperty({ example: 500, minimum: 1, description: 'In-game points for the points method, cents for the online method' })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    price: number
}
