import type { Board, Piece, Move, PlayerColor, Narc, GameLogEntry } from '../../../pages/Game/types'

export const PlayerColors = {
    WHITE: 'white',
    BLACK: 'black'
} as const

export type { PlayerColor }

export const BoardSizeKeys = {
    SMALL: '12x12',
    MEDIUM: '12x16',
    LARGE: '12x20'
} as const

export type BoardSizeKey = typeof BoardSizeKeys[keyof typeof BoardSizeKeys]

export const GameStatuses = {
    WAITING: 'waiting',
    IN_PROGRESS: 'in_progress',
    FINISHED: 'finished'
} as const

export type GameStatus = typeof GameStatuses[keyof typeof GameStatuses]

export interface BoardSize {
    rows: number
    cols: number
}

export const BOARD_SIZES: Record<BoardSizeKey, BoardSize> = {
    [BoardSizeKeys.SMALL]: { rows: 12, cols: 12 },
    [BoardSizeKeys.MEDIUM]: { rows: 12, cols: 16 },
    [BoardSizeKeys.LARGE]: { rows: 12, cols: 20 }
}

export interface Player {
    id: string
    name: string
    color: PlayerColor
    joinedAt: Date
    level: number
    points?: number
}

export interface GameBoardState {
    board: Board
    currentPlayer: PlayerColor
    moveHistory: Move[]
    gameLogs?: GameLogEntry[]
    capturedPieces: { white: Piece[]; black: Piece[] }
    whitePoints?: number
    blackPoints?: number
    lastMove: Move | null
    gameOver: boolean
    winner: PlayerColor | null
    narcs: Narc[]
    nightMode: boolean
}

export interface GameSession {
    code: string
    boardSizeKey: BoardSizeKey
    boardSize: BoardSize
    status: GameStatus
    players: Player[]
    createdAt: Date
    hostPlayerId: string
    gameState?: GameBoardState
}

export interface CreateGameRequest {
    playerName: string
    boardSizeKey?: BoardSizeKey
}

export interface JoinGameRequest {
    code: string
    playerName: string
}

export interface GetGameRequest {
    code: string
    playerId?: string
}

export interface SyncGameRequest {
    code: string
    gameState: GameBoardState
}

export interface SaveOfflineGameRequest {
    boardSizeKey: BoardSizeKey
    mode: 'SINGLE' | 'OFFLINE'
    winner: PlayerColor | null
    playerColor: PlayerColor
    moves: number
    points: number
}

export type GameMode = 'SINGLE' | 'OFFLINE' | 'ONLINE'
export type GameRecordStatus = 'WIN' | 'LOSS' | 'DRAW'

export interface OpponentStats {
    points: number
    level: number
    wins: number
    losses: number
    draws: number
    rank: number
}

export interface OpponentRecord {
    uuid: string
    user_uuid: string
    status: GameRecordStatus
    points: number
    moves: number
    time: number | null
    username: string
    stats: OpponentStats | null
}

export interface GameRecord {
    id: number
    uuid: string
    user_uuid: string
    code: string | null
    board_size: string
    mode: GameMode
    status: GameRecordStatus
    time: number | null
    moves: number
    points: number
    logs: GameLogEntry[] | null
    created_at: string
    finished_at: string | null
    opponent?: OpponentRecord | null
}

export interface GetGamesParams {
    page?: number
    limit?: number
    user_uuid?: string
    mode?: GameMode
    status?: GameRecordStatus
    board_size?: string
    sort_by?: 'created_at' | 'finished_at' | 'points' | 'moves' | 'time'
    sort_order?: 'asc' | 'desc'
}

export interface PaginatedGamesResponse {
    data: GameRecord[]
    total: number
    page: number
    limit: number
}
