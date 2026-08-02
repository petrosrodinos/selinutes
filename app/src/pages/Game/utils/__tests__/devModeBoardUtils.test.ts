import { describe, it, expect } from 'vitest'
import {
  getDevModeContentsInRect,
  getSelectionBounds,
  moveDevModeSelection,
  normalizeRect,
  isPositionSelected
} from '../devModeBoardUtils'
import { PieceTypes, PlayerColors, ObstacleTypes, isPiece, isObstacle } from '../../types'
import { createEmptyBoard, placePiece, placeObstacle, pos, expectSamePositions } from './helpers/boardFixtures'

const SIZE = { rows: 12, cols: 12 }

describe('normalizeRect', () => {
  it('orders corners regardless of drag direction', () => {
    expect(normalizeRect(pos(5, 7), pos(2, 3))).toEqual({
      minRow: 2,
      maxRow: 5,
      minCol: 3,
      maxCol: 7
    })
  })
})

describe('getDevModeContentsInRect', () => {
  it('selects pieces and obstacles inside the rectangle', () => {
    const board = createEmptyBoard(SIZE)
    placePiece(board, pos(2, 2), { type: PieceTypes.HOPLITE, color: PlayerColors.WHITE })
    placePiece(board, pos(2, 3), { type: PieceTypes.PALADIN, color: PlayerColors.WHITE })
    placePiece(board, pos(4, 4), { type: PieceTypes.MONARCH, color: PlayerColors.BLACK })
    placeObstacle(board, pos(2, 4), ObstacleTypes.TREE)

    expectSamePositions(getDevModeContentsInRect(board, pos(2, 2), pos(3, 4)), [
      pos(2, 2),
      pos(2, 3),
      pos(2, 4)
    ])
  })
})

describe('getSelectionBounds', () => {
  it('returns null for an empty selection', () => {
    expect(getSelectionBounds([])).toBeNull()
  })

  it('returns the bounding box of selected positions', () => {
    expect(getSelectionBounds([pos(4, 1), pos(2, 5), pos(3, 3)])).toEqual({
      minRow: 2,
      maxRow: 4,
      minCol: 1,
      maxCol: 5
    })
  })
})

describe('isPositionSelected', () => {
  it('checks membership by row and col', () => {
    expect(isPositionSelected([pos(1, 1), pos(2, 2)], pos(2, 2))).toBe(true)
    expect(isPositionSelected([pos(1, 1), pos(2, 2)], pos(3, 3))).toBe(false)
  })
})

describe('moveDevModeSelection', () => {
  it('translates selected figures by the anchor delta', () => {
    const board = createEmptyBoard(SIZE)
    const a = placePiece(board, pos(2, 2), { type: PieceTypes.HOPLITE, color: PlayerColors.WHITE, id: 'a' })
    const b = placePiece(board, pos(2, 3), { type: PieceTypes.PALADIN, color: PlayerColors.WHITE, id: 'b' })

    const next = moveDevModeSelection(board, [pos(2, 2), pos(2, 3)], pos(5, 4), SIZE)

    expect(next).not.toBeNull()
    expect(next![2][2]).toBeNull()
    expect(next![2][3]).toBeNull()
    expect(isPiece(next![5][4]) && next![5][4].id).toBe(a.id)
    expect(isPiece(next![5][5]) && next![5][5].id).toBe(b.id)
  })

  it('translates selected obstacles by the anchor delta', () => {
    const board = createEmptyBoard(SIZE)
    placeObstacle(board, pos(3, 3), ObstacleTypes.TREE)
    placeObstacle(board, pos(3, 4), ObstacleTypes.ROCK)

    const next = moveDevModeSelection(board, [pos(3, 3), pos(3, 4)], pos(6, 5), SIZE)

    expect(next).not.toBeNull()
    expect(next![3][3]).toBeNull()
    expect(next![3][4]).toBeNull()
    expect(isObstacle(next![6][5]) && next![6][5].type).toBe(ObstacleTypes.TREE)
    expect(isObstacle(next![6][6]) && next![6][6].type).toBe(ObstacleTypes.ROCK)
  })

  it('moves mixed figure and obstacle selections together', () => {
    const board = createEmptyBoard(SIZE)
    const piece = placePiece(board, pos(2, 2), { type: PieceTypes.HOPLITE, color: PlayerColors.WHITE, id: 'p' })
    placeObstacle(board, pos(2, 3), ObstacleTypes.CAVE)

    const next = moveDevModeSelection(board, [pos(2, 2), pos(2, 3)], pos(4, 4), SIZE)

    expect(next).not.toBeNull()
    expect(isPiece(next![4][4]) && next![4][4].id).toBe(piece.id)
    expect(isObstacle(next![4][5]) && next![4][5].type).toBe(ObstacleTypes.CAVE)
  })

  it('returns null when a destination is off the board', () => {
    const board = createEmptyBoard(SIZE)
    placePiece(board, pos(2, 2), { type: PieceTypes.HOPLITE, color: PlayerColors.WHITE })
    placePiece(board, pos(2, 3), { type: PieceTypes.PALADIN, color: PlayerColors.WHITE })

    expect(moveDevModeSelection(board, [pos(2, 2), pos(2, 3)], pos(11, 11), SIZE)).toBeNull()
  })

  it('returns null when a destination is blocked by a non-selected obstacle', () => {
    const board = createEmptyBoard(SIZE)
    placePiece(board, pos(2, 2), { type: PieceTypes.HOPLITE, color: PlayerColors.WHITE })
    placeObstacle(board, pos(4, 2), ObstacleTypes.ROCK)

    expect(moveDevModeSelection(board, [pos(2, 2)], pos(4, 2), SIZE)).toBeNull()
  })

  it('returns null when a destination is occupied by a non-selected piece', () => {
    const board = createEmptyBoard(SIZE)
    placePiece(board, pos(2, 2), { type: PieceTypes.HOPLITE, color: PlayerColors.WHITE })
    placePiece(board, pos(4, 2), { type: PieceTypes.MONARCH, color: PlayerColors.BLACK })

    expect(moveDevModeSelection(board, [pos(2, 2)], pos(4, 2), SIZE)).toBeNull()
  })

  it('allows destinations that land on currently selected tiles', () => {
    const board = createEmptyBoard(SIZE)
    const a = placePiece(board, pos(2, 2), { type: PieceTypes.HOPLITE, color: PlayerColors.WHITE, id: 'a' })
    const b = placePiece(board, pos(2, 3), { type: PieceTypes.PALADIN, color: PlayerColors.WHITE, id: 'b' })

    const next = moveDevModeSelection(board, [pos(2, 2), pos(2, 3)], pos(2, 3), SIZE)

    expect(next).not.toBeNull()
    expect(next![2][2]).toBeNull()
    expect(isPiece(next![2][3]) && next![2][3].id).toBe(a.id)
    expect(isPiece(next![2][4]) && next![2][4].id).toBe(b.id)
  })
})
