import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { CacheService } from '@/shared/services/cache/cache.service'
import { PrismaService } from '@/core/databases/prisma/prisma.service'
import { CreateGameDto } from './dto/create-game.dto'
import { JoinGameDto } from './dto/join-game.dto'
import { GetGameDto } from './dto/get-game.dto'
import {
    GameSession
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
import { GameMode, GameStatus } from 'generated/prisma'
import { getLevelFromPoints } from './constants/game-rewards.constants'
import { SaveOfflineGameDto } from './dto/save-offline-game.dto'
import { GetGamesDto, GameSortBy, SortOrder } from './dto/get-games.dto'
import { Game } from 'generated/prisma'

@Injectable()
export class GameService {
    private readonly logger = new Logger(GameService.name)

    constructor(
        private readonly cacheService: CacheService,
        private readonly prisma: PrismaService
    ) { }

    async getGameRecord(uuid: string): Promise<Game & { opponent: (Game & { username: string; stats: { points: number; level: number; wins: number; losses: number; draws: number; rank: number } | null }) | null }> {
        const game = await this.prisma.game.findUnique({ where: { uuid } })

        if (!game) {
            throw new NotFoundException('Game not found')
        }

        let opponent = null
        if (game.code) {
            const opponentGame = await this.prisma.game.findFirst({
                where: { code: game.code, user_uuid: { not: game.user_uuid } },
            })

            if (opponentGame) {
                const [opponentUser] = await Promise.all([
                    this.prisma.user.findUnique({
                        where: { uuid: opponentGame.user_uuid },
                        select: {
                            username: true,
                            stats: true
                        }
                    }),
                ])

                opponent = {
                    ...opponentGame,
                    username: opponentUser?.username ?? 'Unknown',
                    stats: opponentUser?.stats ?? null,
                }
            }
        }

        return { ...game, opponent }
    }

    async getGames(dto: GetGamesDto): Promise<{ data: Game[]; total: number; page: number; limit: number }> {
        const { page = 1, limit = 10, user_uuid, mode, status, board_size, sort_by = GameSortBy.CREATED_AT, sort_order = SortOrder.DESC } = dto
        const skip = (page - 1) * limit

        const where = {
            ...(user_uuid && { user_uuid }),
            ...(mode && { mode }),
            ...(status && { status }),
            ...(board_size && { board_size }),
        }

        const [data, total] = await Promise.all([
            this.prisma.game.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort_by]: sort_order },
            }),
            this.prisma.game.count({ where }),
        ])

        return { data, total, page, limit }
    }

    async createGame(dto: CreateGameDto): Promise<GameSession> {
        const code = generateGameCode()
        const boardSizeKey: BoardSizeKey = dto?.boardSizeKey || BoardSizeKeys.SMALL

        const gameState = {
            board: dto.gameState?.board,
            currentPlayer: PlayerColors.WHITE,
            moveHistory: [],
            capturedPieces: { white: [], black: [] },
            whitePoints: 0,
            blackPoints: 0,
            lastMove: null,
            gameOver: false,
            winner: null,
            nightMode: false
        }

        const gameSession: GameSession = {
            code,
            boardSizeKey,
            boardSize: BOARD_SIZES[boardSizeKey],
            status: GameStatuses.WAITING,
            players: [
                {
                    id: dto.playerId,
                    name: dto.playerName,
                    color: PlayerColors.WHITE,
                    joinedAt: new Date()
                }
            ],
            createdAt: new Date(),
            hostPlayerId: dto.playerId,
            gameState
        }

        await this.cacheService.set(getGameKey(code), gameSession, GAME_TTL)

        return gameSession
    }

    async joinGame(dto: JoinGameDto): Promise<GameSession> {
        const gameSession = await this.getGameSession(dto.code)

        if (!gameSession) {
            throw new NotFoundException('Game not found')
        }

        const existingPlayer = gameSession.players.find(p => p.id === dto.playerId)

        if (existingPlayer) {
            return gameSession
        }

        if (gameSession.status !== GameStatuses.WAITING) {
            throw new BadRequestException('Game already started or finished')
        }

        // if (gameSession.players.length >= 2) {
        //     throw new BadRequestException('Game is full')
        // }

        const updatedGameSession: GameSession = {
            ...gameSession,
            status: GameStatuses.IN_PROGRESS,
            players: [
                ...gameSession.players,
                {
                    id: dto.playerId,
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

        return updatedGameSession
    }

    async getLocalGame(dto: GetGameDto): Promise<GameSession> {
        const gameSession = await this.getGameSession(dto.code)

        if (!gameSession) {
            throw new NotFoundException('Game not found')
        }

        return gameSession
    }

    async updateGameState(code: string, gameState: GameSession['gameState']): Promise<GameSession> {
        const gameSession = await this.getGameSession(code)

        if (!gameSession) {
            throw new NotFoundException('Game not found')
        }

        const winner = gameState?.winner ?? null
        const isGameOver = gameState?.gameOver ?? false
        const whitePoints = gameState?.whitePoints ?? 0
        const blackPoints = gameState?.blackPoints ?? 0

        const updatedPlayers = isGameOver
            ? gameSession.players.map(player => ({
                ...player,
                points: player.color === PlayerColors.WHITE ? whitePoints : blackPoints
            }))
            : gameSession.players

        const updatedGameSession: GameSession = {
            ...gameSession,
            players: updatedPlayers,
            gameState: {
                board: gameState?.board,
                currentPlayer: gameState?.currentPlayer,
                moveHistory: gameState?.moveHistory,
                capturedPieces: gameState?.capturedPieces,
                whitePoints,
                blackPoints,
                lastMove: gameState?.lastMove,
                gameOver: isGameOver,
                winner: gameState?.winner,
                nightMode: gameState?.nightMode ?? false
            },
            status: isGameOver ? GameStatuses.FINISHED : gameSession.status
        }

        await this.cacheService.set(
            getGameKey(code),
            updatedGameSession,
            GAME_TTL
        )

        if (gameState?.gameOver && !gameSession.gameState?.gameOver) {
            await this.saveFinishedGame(updatedGameSession)
        }

        return updatedGameSession
    }

    async saveOfflineGame(userUuid: string, dto: SaveOfflineGameDto): Promise<void> {
        const status: GameStatus = dto.winner === null
            ? GameStatus.DRAW
            : dto.playerColor === dto.winner
                ? GameStatus.WIN
                : GameStatus.LOSS

        await this.prisma.game.create({
            data: {
                user_uuid: userUuid,
                code: '',
                board_size: dto.boardSizeKey,
                mode: dto.mode,
                status,
                moves: dto.moves,
                points: dto.points,
                finished_at: new Date(),
            }
        })

        const existingStats = await this.prisma.userStats.findUnique({ where: { user_uuid: userUuid } })
        const newPoints = (existingStats?.points ?? 0) + dto.points
        const newWins = (existingStats?.wins ?? 0) + (status === GameStatus.WIN ? 1 : 0)
        const newLosses = (existingStats?.losses ?? 0) + (status === GameStatus.LOSS ? 1 : 0)
        const newDraws = (existingStats?.draws ?? 0) + (status === GameStatus.DRAW ? 1 : 0)

        await this.prisma.userStats.upsert({
            where: { user_uuid: userUuid },
            create: {
                user_uuid: userUuid,
                points: newPoints,
                wins: newWins,
                losses: newLosses,
                draws: newDraws,
                level: getLevelFromPoints(newPoints),
            },
            update: {
                points: newPoints,
                wins: newWins,
                losses: newLosses,
                draws: newDraws,
                level: getLevelFromPoints(newPoints),
            }
        })
    }

    async deleteGame(code: string): Promise<void> {
        await this.cacheService.delete(getGameKey(code))
    }

    /**
     * When the last Socket.IO client leaves the room, persist the online match if it had two players
     * and Prisma does not already have both rows. If the game did not end with a board winner set,
     * outcome uses the same rules as a normal finish: winner is the color with higher captured points;
     * tied points are recorded as a draw.
     */
    async finalizeOnlineSessionWhenRoomEmpty(code: string): Promise<void> {
        const gameSession = await this.getGameSession(code)

        const existingCount = await this.prisma.game.count({ where: { code } })
        if (existingCount >= 2) {
            await this.cacheService.delete(getGameKey(code))
            return
        }

        if (!gameSession) {
            await this.cacheService.delete(getGameKey(code))
            return
        }

        if (gameSession.players.length < 2) {
            await this.cacheService.delete(getGameKey(code))
            return
        }

        if (existingCount === 1) {
            this.logger.warn(`Game ${code}: expected 0 or 2 DB rows, found 1 — skipping persist, clearing cache`)
            await this.cacheService.delete(getGameKey(code))
            return
        }

        const gs = gameSession.gameState
        const finishedWithWinner = gs?.gameOver === true && gs?.winner !== null

        if (finishedWithWinner) {
            await this.saveFinishedGame(gameSession)
        } else {
            const whitePoints = gs?.whitePoints ?? 0
            const blackPoints = gs?.blackPoints ?? 0
            let winnerByPoints: typeof PlayerColors.WHITE | typeof PlayerColors.BLACK | null = null
            if (whitePoints > blackPoints) {
                winnerByPoints = PlayerColors.WHITE
            } else if (blackPoints > whitePoints) {
                winnerByPoints = PlayerColors.BLACK
            }

            const resolvedSession: GameSession = {
                ...gameSession,
                status: GameStatuses.FINISHED,
                gameState: gs
                    ? {
                        ...gs,
                        gameOver: true,
                        winner: winnerByPoints
                    }
                    : {
                        board: [],
                        currentPlayer: PlayerColors.WHITE,
                        moveHistory: [],
                        capturedPieces: { white: [], black: [] },
                        whitePoints: 0,
                        blackPoints: 0,
                        lastMove: null,
                        gameOver: true,
                        winner: winnerByPoints,
                        nightMode: false
                    }
            }
            await this.saveFinishedGame(resolvedSession)
        }

        await this.cacheService.delete(getGameKey(code))
    }

    async finishGame(code: string): Promise<void> {
        const gameSession = await this.getGameSession(code)

        if (!gameSession) {
            throw new NotFoundException('Game not found')
        }

        if (!gameSession.gameState?.gameOver) {
            throw new BadRequestException('Game is not over yet')
        }

        await this.saveFinishedGame(gameSession)
    }

    private async saveFinishedGame(gameSession: GameSession): Promise<void> {
        try {
            const existing = await this.prisma.game.findMany({ where: { code: gameSession.code } })
            if (existing.length > 2) return

            const { code, boardSizeKey, players, createdAt, gameState } = gameSession
            const winner = gameState?.winner ?? null
            const moves = gameState?.moveHistory?.length ?? 0
            const finishedAt = new Date()
            const timeInSeconds = Math.floor((finishedAt.getTime() - new Date(createdAt).getTime()) / 1000)
            const whitePoints = gameState?.whitePoints ?? 0
            const blackPoints = gameState?.blackPoints ?? 0

            for (const player of players) {
                const status: GameStatus = winner === null
                    ? GameStatus.DRAW
                    : player.color === winner
                        ? GameStatus.WIN
                        : GameStatus.LOSS

                const pointsFromState = player.color === PlayerColors.WHITE ? whitePoints : blackPoints
                const points = pointsFromState > 0 ? pointsFromState : (player.points ?? 0)

                await this.prisma.game.create({
                    data: {
                        user_uuid: player.id,
                        code,
                        board_size: boardSizeKey,
                        mode: GameMode.ONLINE,
                        status,
                        time: timeInSeconds,
                        moves,
                        points,
                        finished_at: finishedAt,
                    }
                })

                const existingStats = await this.prisma.userStats.findUnique({
                    where: { user_uuid: player.id }
                })

                const newPoints = (existingStats?.points ?? 0) + points
                const newWins = (existingStats?.wins ?? 0) + (status === GameStatus.WIN ? 1 : 0)
                const newLosses = (existingStats?.losses ?? 0) + (status === GameStatus.LOSS ? 1 : 0)
                const newDraws = (existingStats?.draws ?? 0) + (status === GameStatus.DRAW ? 1 : 0)
                const newLevel = getLevelFromPoints(newPoints)
                const newRank = await this.calculateRank(player.id, newPoints)

                await this.prisma.userStats.upsert({
                    where: { user_uuid: player.id },
                    create: {
                        user_uuid: player.id,
                        points: newPoints,
                        wins: newWins,
                        losses: newLosses,
                        draws: newDraws,
                        level: newLevel,
                        rank: newRank,
                    },
                    update: {
                        points: newPoints,
                        wins: newWins,
                        losses: newLosses,
                        draws: newDraws,
                        level: newLevel,
                        rank: newRank,
                    }
                })

                this.logger.log(`Saved game record for player ${player.id} (${status}, ${points} pts, rank #${newRank})`)
            }
        } catch (error) {
            this.logger.error(`Failed to save finished game ${gameSession.code}: ${error.message}`)
        }
    }

    private async calculateRank(userUuid: string, newPoints: number): Promise<number> {
        const usersAhead = await this.prisma.userStats.count({
            where: {
                points: { gt: newPoints },
                user_uuid: { not: userUuid },
            }
        })
        return usersAhead + 1
    }

    private async getGameSession(code: string): Promise<GameSession | undefined> {
        return this.cacheService.get<GameSession>(getGameKey(code))
    }
}
