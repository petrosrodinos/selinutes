export const PlayerColors = {
    WHITE: 'white',
    BLACK: 'black'
} as const

export type PlayerColor = typeof PlayerColors[keyof typeof PlayerColors]

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

export const GAME_TTL = 1000 * 60 * 60 * 2

export const GAME_KEY_PREFIX = 'game:'
