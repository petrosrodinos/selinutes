import { ApiProperty } from '@nestjs/swagger'
import { AuthRole } from 'generated/prisma'
import { IsEmail, IsEnum, IsInt, IsString, Max, Min, MinLength } from 'class-validator'
import { MAX_LEVEL } from '../../game/constants/game-rewards.constants'

export class UpdateAdminUserDto {
    @ApiProperty({ example: 'player_one' })
    @IsString()
    @MinLength(2)
    username: string

    @ApiProperty({ example: 'player@example.com' })
    @IsEmail()
    email: string

    @ApiProperty({ enum: AuthRole, example: AuthRole.USER })
    @IsEnum(AuthRole)
    role: AuthRole

    @ApiProperty({ example: 1200, minimum: 0 })
    @IsInt()
    @Min(0)
    points: number

    @ApiProperty({ example: 12, minimum: 1, maximum: MAX_LEVEL })
    @IsInt()
    @Min(1)
    @Max(MAX_LEVEL)
    level: number

    @ApiProperty({ example: 5, minimum: 1 })
    @IsInt()
    @Min(1)
    rank: number

    @ApiProperty({ example: 10, minimum: 0 })
    @IsInt()
    @Min(0)
    wins: number

    @ApiProperty({ example: 5, minimum: 0 })
    @IsInt()
    @Min(0)
    losses: number

    @ApiProperty({ example: 2, minimum: 0 })
    @IsInt()
    @Min(0)
    draws: number
}
