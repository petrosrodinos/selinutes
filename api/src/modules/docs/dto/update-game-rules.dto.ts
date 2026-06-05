import { IsString, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateGameRulesDto {
    @ApiProperty({ description: 'Full markdown content for game-rules.md' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200_000)
    content: string
}
