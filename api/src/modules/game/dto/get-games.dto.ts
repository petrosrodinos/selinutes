import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { GameMode, GameStatus } from 'generated/prisma'

export enum GameSortBy {
    CREATED_AT = 'created_at',
    FINISHED_AT = 'finished_at',
    POINTS = 'points',
    MOVES = 'moves',
    TIME = 'time',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class GetGamesDto {
    @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1

    @ApiPropertyOptional({ description: 'Items per page', default: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10

    @ApiPropertyOptional({ description: 'Filter by user UUID' })
    @IsOptional()
    @IsString()
    user_uuid?: string

    @ApiPropertyOptional({ description: 'Filter by game mode', enum: GameMode })
    @IsOptional()
    @IsEnum(GameMode)
    mode?: GameMode

    @ApiPropertyOptional({ description: 'Filter by game status', enum: GameStatus })
    @IsOptional()
    @IsEnum(GameStatus)
    status?: GameStatus

    @ApiPropertyOptional({ description: 'Filter by board size', example: '12x12' })
    @IsOptional()
    @IsString()
    board_size?: string

    @ApiPropertyOptional({ description: 'Field to sort by', enum: GameSortBy, default: GameSortBy.CREATED_AT })
    @IsOptional()
    @IsEnum(GameSortBy)
    sort_by?: GameSortBy = GameSortBy.CREATED_AT

    @ApiPropertyOptional({ description: 'Sort direction', enum: SortOrder, default: SortOrder.DESC })
    @IsOptional()
    @IsEnum(SortOrder)
    sort_order?: SortOrder = SortOrder.DESC
}
