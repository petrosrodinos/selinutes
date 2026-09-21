import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class ConfirmCheckoutDto {
    @ApiProperty({ example: 'cs_test_a1b2c3' })
    @IsString()
    @MinLength(1)
    session_id: string
}
