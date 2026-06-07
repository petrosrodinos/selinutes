import { expect } from 'vitest'
import type { Board, BoardSize, Piece, PieceType, PlayerColor, Position, ObstacleType } from '../../../types'
import { PlayerColors } from '../../../types'

export const DEFAULT_SIZE: BoardSize = { rows: 12, cols: 12 }

export const BOTH_COLORS: PlayerColor[] = [PlayerColors.WHITE, PlayerColors.BLACK]

export const pos = (row: number, col: number): Position => ({ row, col })

export const opponentOf = (color: PlayerColor): PlayerColor =>
  color === PlayerColors.WHITE ? PlayerColors.BLACK : PlayerColors.WHITE

export const forwardDirection = (color: PlayerColor): number =>
  color === PlayerColors.WHITE ? -1 : 1

export const createEmptyBoard = (size: BoardSize = DEFAULT_SIZE): Board =>
  Array.from({ length: size.rows }, () => Array.from({ length: size.cols }, () => null))

let fixtureIdCounter = 0

export interface PlacePieceOptions {
  type: PieceType
  color: PlayerColor
  startCol?: number
  hasMoved?: boolean
  isZombie?: boolean
  promotedFromHoplite?: boolean
  reviveCount?: number
  frozenTurns?: number
  standingOnObstacle?: ObstacleType
  id?: string
}

export const placePiece = (board: Board, position: Position, options: PlacePieceOptions): Piece => {
  const piece: Piece = {
    id: options.id ?? `fixture-${++fixtureIdCounter}`,
    type: options.type,
    color: options.color,
    hasMoved: options.hasMoved ?? false,
    startCol: options.startCol,
    isZombie: options.isZombie,
    promotedFromHoplite: options.promotedFromHoplite,
    reviveCount: options.reviveCount,
    frozenTurns: options.frozenTurns,
    standingOnObstacle: options.standingOnObstacle
  }
  board[position.row][position.col] = piece
  return piece
}

export const placeObstacle = (board: Board, position: Position, obstacleType: ObstacleType): void => {
  board[position.row][position.col] = { type: obstacleType }
}

const sortPositions = (positions: Position[]): Position[] =>
  [...positions].sort((a, b) => (a.row - b.row) || (a.col - b.col))

export const sorted = (positions: Position[]): Position[] => sortPositions(positions)

export const expectSamePositions = (actual: Position[], expected: Position[]): void => {
  expect(sortPositions(actual)).toEqual(sortPositions(expected))
}

export const expectContainsPositions = (actual: Position[], expected: Position[]): void => {
  for (const position of expected) {
    expect(actual).toContainEqual(position)
  }
}

export const expectExcludesPositions = (actual: Position[], excluded: Position[]): void => {
  for (const position of excluded) {
    expect(actual).not.toContainEqual(position)
  }
}
