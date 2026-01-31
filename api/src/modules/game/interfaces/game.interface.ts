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
}

export interface GameSession {
    code: string
    boardSizeKey: BoardSizeKey
    boardSize: BoardSize
    status: GameStatus
    players: Player[]
    currentPlayer: PlayerColor
    createdAt: Date
    hostPlayerId: string
}