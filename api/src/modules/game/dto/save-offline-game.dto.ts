import { IsString, IsIn, IsOptional, IsInt, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BoardSizeKeys, BoardSizeKey, PlayerColors, PlayerColor } from '../constants/game.constants'
import { GameMode } from 'generated/prisma'

const BOARD_SIZE_VALUES = Object.values(BoardSizeKeys)
const PLAYER_COLOR_VALUES = Object.values(PlayerColors)
const OFFLINE_GAME_MODES = [GameMode.SINGLE, GameMode.OFFLINE] as const

export class SaveOfflineGameDto {
    @ApiProperty({ description: 'Board size key', enum: BOARD_SIZE_VALUES })
    @IsIn(BOARD_SIZE_VALUES)
    boardSizeKey: BoardSizeKey

    @ApiProperty({ description: 'Game mode', enum: OFFLINE_GAME_MODES })
    @IsIn(OFFLINE_GAME_MODES)
    mode: typeof OFFLINE_GAME_MODES[number]

    @ApiProperty({ description: 'Winner color', enum: [...PLAYER_COLOR_VALUES, null], nullable: true })
    @IsOptional()
    @IsIn([...PLAYER_COLOR_VALUES, null])
    winner: PlayerColor | null

    @ApiProperty({ description: 'Color played by the authenticated user', enum: PLAYER_COLOR_VALUES })
    @IsIn(PLAYER_COLOR_VALUES)
    playerColor: PlayerColor

    @ApiProperty({ description: 'Total moves made' })
    @IsInt()
    @Min(0)
    moves: number

    @ApiProperty({ description: 'Points earned by the authenticated user' })
    @IsInt()
    @Min(0)
    points: number
}
