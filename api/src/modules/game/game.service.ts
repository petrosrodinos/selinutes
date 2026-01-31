import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { CacheService } from '@/shared/services/cache/cache.service'
import { CreateGameDto } from './dto/create-game.dto'
import { JoinGameDto } from './dto/join-game.dto'
import {
    GameSession,
} from './interfaces/game.interface'
import {
    BOARD_SIZES,
    GAME_TTL,
    BoardSizeKeys,
    BoardSizeKey,
    GameStatuses,
    PlayerColors
} from './constants/game.constants'
import { generateGameCode, getGameKey } from './helpers/game.helper'
import { v4 as uuid } from 'uuid'

@Injectable()
export class GameService {
    constructor(private readonly cacheService: CacheService) { }

    async createGame(dto: CreateGameDto): Promise<GameSession> {
        const code = generateGameCode()
        const playerId = uuid()
        const boardSizeKey: BoardSizeKey = dto.boardSizeKey || BoardSizeKeys.SMALL

        const gameSession: GameSession = {
            code,
            boardSizeKey,
            boardSize: BOARD_SIZES[boardSizeKey],
            status: GameStatuses.WAITING,
            players: [
                {
                    id: playerId,
                    name: dto.playerName,
                    color: PlayerColors.WHITE,
                    joinedAt: new Date()
                }
            ],
            currentPlayer: PlayerColors.WHITE,
            createdAt: new Date(),
            hostPlayerId: playerId
        }

        await this.cacheService.set(getGameKey(code), gameSession, GAME_TTL)

        return gameSession;
    }

    async joinGame(dto: JoinGameDto): Promise<GameSession> {
        const gameSession = await this.getGameSession(dto.code)

        if (!gameSession) {
            throw new NotFoundException('Game not found')
        }

        if (gameSession.status !== GameStatuses.WAITING) {
            throw new BadRequestException('Game already started or finished')
        }

        if (gameSession.players.length >= 2) {
            throw new BadRequestException('Game is full')
        }

        const playerId = uuid()

        const updatedGameSession: GameSession = {
            ...gameSession,
            status: GameStatuses.IN_PROGRESS,
            players: [
                ...gameSession.players,
                {
                    id: playerId,
                    name: dto.playerName,
                    color: PlayerColors.BLACK,
                    joinedAt: new Date()
                }
            ]
        }

        await this.cacheService.set(
            getGameKey(dto.code),
            updatedGameSession,
            GAME_TTL
        )

        return updatedGameSession;
    }

    async getGame(code: string): Promise<GameSession> {
        const gameSession = await this.getGameSession(code)

        if (!gameSession) {
            throw new NotFoundException('Game not found')
        }

        return gameSession;
    }

    private async getGameSession(code: string): Promise<GameSession | undefined> {
        return this.cacheService.get<GameSession>(getGameKey(code))
    }
}
