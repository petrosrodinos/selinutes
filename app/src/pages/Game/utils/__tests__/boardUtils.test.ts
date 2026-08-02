import { describe, it, expect } from 'vitest'
import {
  createInitialBoard,
  cloneBoard,
  shuffleFiguresOnBoard,
  stripObstaclesFromBoard,
  clearObstacleAt,
  isInBounds,
  getObstacleType,
  findPiecePositions,
  findAllCaves
} from '../boardUtils'
import { PieceTypes, ObstacleTypes, isPiece, isObstacle } from '../../types'
import type { BoardSize } from '../../types'
import { createEmptyBoard, placePiece, placeObstacle, pos } from './helpers/boardFixtures'

const SIZES: BoardSize[] = [
  { rows: 12, cols: 12 },
  { rows: 12, cols: 16 },
  { rows: 12, cols: 20 }
]

describe('createInitialBoard', () => {
  it.each(SIZES)('fills both home rows and mirrors the back rows ($cols cols)', (size) => {
    const board = createInitialBoard(size)
    const lastRow = size.rows - 1

    for (let col = 0; col < size.cols; col++) {
      const blackBack = board[0][col]
      const blackPawn = board[1][col]
      const whitePawn = board[lastRow - 1][col]
      const whiteBack = board[lastRow][col]

      expect(isPiece(blackBack) && blackBack.color).toBe('black')
      expect(isPiece(blackPawn) && blackPawn.type).toBe(PieceTypes.HOPLITE)
      expect(isPiece(whitePawn) && whitePawn.type).toBe(PieceTypes.HOPLITE)
      expect(isPiece(whiteBack) && whiteBack.color).toBe('white')
      expect(isPiece(blackBack) && isPiece(whiteBack) && blackBack.type === whiteBack.type).toBe(true)
    }
  })

  it('gives each player exactly one monarch', () => {
    const board = createInitialBoard(SIZES[0])

    expect(findPiecePositions(board, PieceTypes.MONARCH)).toHaveLength(2)
  })
})

describe('cloneBoard', () => {
  it('deep-copies cells so mutations do not leak', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(5, 5), { type: PieceTypes.RAM_TOWER, color: 'white' })

    const clone = cloneBoard(board)
    const cloned = clone[5][5]
    if (cloned && isPiece(cloned)) cloned.hasMoved = true

    const original = board[5][5]
    expect(isPiece(original) && original.hasMoved).toBe(false)
  })
})

describe('isInBounds', () => {
  const size: BoardSize = { rows: 12, cols: 12 }

  it('detects in-bounds and out-of-bounds positions', () => {
    expect(isInBounds(0, 0, size)).toBe(true)
    expect(isInBounds(11, 11, size)).toBe(true)
    expect(isInBounds(-1, 0, size)).toBe(false)
    expect(isInBounds(12, 0, size)).toBe(false)
    expect(isInBounds(0, 12, size)).toBe(false)
  })
})

describe('getObstacleType', () => {
  it('reads the obstacle type or null', () => {
    const board = createEmptyBoard()
    placeObstacle(board, pos(4, 4), ObstacleTypes.ROCK)
    placePiece(board, pos(5, 5), { type: PieceTypes.HOPLITE, color: 'white' })

    expect(getObstacleType(board, 4, 4)).toBe(ObstacleTypes.ROCK)
    expect(getObstacleType(board, 5, 5)).toBeNull()
    expect(getObstacleType(board, 0, 0)).toBeNull()
  })
})

describe('findPiecePositions', () => {
  it('returns every position of a given piece type', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(1, 1), { type: PieceTypes.HOPLITE, color: 'white' })
    placePiece(board, pos(2, 2), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(3, 3), { type: PieceTypes.RAM_TOWER, color: 'white' })

    expect(findPiecePositions(board, PieceTypes.HOPLITE)).toHaveLength(2)
  })
})

describe('findAllCaves', () => {
  it('locates every cave on the board', () => {
    const board = createEmptyBoard()
    placeObstacle(board, pos(4, 4), ObstacleTypes.CAVE)
    placeObstacle(board, pos(8, 8), ObstacleTypes.CAVE)
    placeObstacle(board, pos(6, 6), ObstacleTypes.ROCK)

    const caves = findAllCaves(board)

    expect(caves).toHaveLength(2)
    expect(caves).toContainEqual({ row: 4, col: 4 })
    expect(caves).toContainEqual({ row: 8, col: 8 })
  })
})

describe('stripObstaclesFromBoard', () => {
  it('removes obstacles and keeps pieces', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(10, 0), { type: PieceTypes.MONARCH, color: 'white', id: 'w-monarch' })
    placeObstacle(board, pos(5, 5), ObstacleTypes.ROCK)

    const stripped = stripObstaclesFromBoard(board)

    expect(isPiece(stripped[10][0]) && stripped[10][0].id).toBe('w-monarch')
    expect(stripped[5][5]).toBeNull()
    expect(isObstacle(board[5][5])).toBe(true)
  })
})

describe('clearObstacleAt', () => {
  it('clears only the target obstacle cell', () => {
    const board = createEmptyBoard()
    placeObstacle(board, pos(5, 5), ObstacleTypes.ROCK)
    placeObstacle(board, pos(6, 6), ObstacleTypes.TREE)

    const cleared = clearObstacleAt(board, pos(5, 5))

    expect(cleared[5][5]).toBeNull()
    expect(isObstacle(cleared[6][6]) && cleared[6][6].type).toBe(ObstacleTypes.TREE)
  })
})

describe('shuffleFiguresOnBoard', () => {
  it('scatters pieces onto empty tiles across the board and leaves obstacles', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(10, 0), { type: PieceTypes.MONARCH, color: 'white', id: 'w-monarch' })
    placePiece(board, pos(10, 1), { type: PieceTypes.DUCHESS, color: 'white', id: 'w-duchess' })
    placePiece(board, pos(10, 2), { type: PieceTypes.HOPLITE, color: 'white', id: 'w-hoplite' })
    placePiece(board, pos(1, 0), { type: PieceTypes.MONARCH, color: 'black', id: 'b-monarch' })
    placePiece(board, pos(1, 1), { type: PieceTypes.DUCHESS, color: 'black', id: 'b-duchess' })
    placeObstacle(board, pos(5, 5), ObstacleTypes.ROCK)

    const beforeIds = board.flat().flatMap((cell) => (cell && isPiece(cell) ? [cell.id] : []))

    const shuffled = shuffleFiguresOnBoard(board)
    const afterPieces = shuffled.flatMap((row, rowIndex) =>
      row.flatMap((cell, colIndex) => (cell && isPiece(cell) ? [{ id: cell.id, row: rowIndex, col: colIndex }] : [])),
    )
    const afterIds = afterPieces.map((piece) => piece.id)

    expect([...afterIds].sort()).toEqual([...beforeIds].sort())
    expect(afterPieces).toHaveLength(5)
    expect(isObstacle(shuffled[5][5]) && shuffled[5][5].type).toBe(ObstacleTypes.ROCK)
    expect(afterPieces.every((piece) => !(piece.row === 5 && piece.col === 5))).toBe(true)
    expect(isPiece(board[10][0]) && board[10][0].type).toBe(PieceTypes.MONARCH)
  })
})
