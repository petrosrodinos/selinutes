import {
    PlayerColor,
    BoardSizeKey,
    BoardSize,
    GameStatus
} from '../constants/game.constants'

export interface Position {
    row: number
    col: number
}

export interface Player {
    id: string
    name: string
    color: PlayerColor
    joinedAt: Date
    points?: number
}

export interface GameLogEntry {
    turn: number
    player: PlayerColor
    description: string
}

export interface GameBoardState {
    board: unknown[][]
    currentPlayer: PlayerColor
    moveHistory: unknown[]
    gameLogs?: GameLogEntry[]
    capturedPieces: { white: unknown[]; black: unknown[] }
    whitePoints?: number
    blackPoints?: number
    lastMove: unknown | null
    gameOver: boolean
    winner: PlayerColor | null
    nightMode?: boolean
    narcs?: unknown[]
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

export interface GetGamePayload {
    code: string
    playerId?: string
}
