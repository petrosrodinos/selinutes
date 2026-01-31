import { IsString, IsIn, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BoardSizeKeys, BoardSizeKey } from '../constants/game.constants'

const BOARD_SIZE_VALUES = Object.values(BoardSizeKeys)

export class CreateGameDto {
    @ApiProperty({ description: 'Player name', example: 'Player1' })
    @IsString()
    playerName: string

    @ApiProperty({
        description: 'Board size key',
        enum: BOARD_SIZE_VALUES,
        default: BoardSizeKeys.SMALL
    })
    @IsOptional()
    @IsIn(BOARD_SIZE_VALUES)
    boardSizeKey?: BoardSizeKey
}
