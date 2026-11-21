import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsISO31661Alpha2, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator'

const trim = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim() : value)

export class ShippingAddressDto {
    @ApiProperty({ example: 'Maria Papadopoulou' })
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    full_name: string

    @ApiProperty({ example: '+357 99 123456' })
    @Transform(trim)
    @IsString()
    @Matches(/^\+?[0-9 ()-]{6,20}$/, { message: 'phone must be a valid phone number' })
    phone: string

    @ApiProperty({ example: '12 Makarios Ave' })
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    line1: string

    @ApiPropertyOptional({ example: 'Apartment 4' })
    @IsOptional()
    @Transform(trim)
    @IsString()
    @MaxLength(200)
    line2?: string

    @ApiProperty({ example: 'Limassol' })
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    city: string

    @ApiPropertyOptional({ example: 'Limassol District' })
    @IsOptional()
    @Transform(trim)
    @IsString()
    @MaxLength(100)
    state?: string

    @ApiProperty({ example: '3025' })
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    postal_code: string

    @ApiProperty({ example: 'CY', description: 'ISO 3166-1 alpha-2 country code' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    @IsISO31661Alpha2()
    country: string
}
