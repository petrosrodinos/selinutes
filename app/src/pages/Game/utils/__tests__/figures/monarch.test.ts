import { describe, it, expect } from 'vitest'
import { getValidMoves, getValidAttacks } from '../../moveUtils'
import { PieceTypes, ObstacleTypes } from '../../../types'
import type { PlayerColor } from '../../../types'
import {
  createEmptyBoard,
  placePiece,
  placeObstacle,
  pos,
  BOTH_COLORS,
  DEFAULT_SIZE,
  opponentOf,
  expectSamePositions,
  expectExcludesPositions
} from '../helpers/boardFixtures'

const adjacent = (row: number, col: number) => [
  pos(row - 1, col - 1), pos(row - 1, col), pos(row - 1, col + 1),
  pos(row, col - 1), pos(row, col + 1),
  pos(row + 1, col - 1), pos(row + 1, col), pos(row + 1, col + 1)
]

describe('Monarch', () => {
  it.each(BOTH_COLORS)('moves one step in any direction (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.MONARCH, color })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectSamePositions(moves, adjacent(6, 5))
  })

  it('does not move two steps', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.MONARCH, color: 'white' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectExcludesPositions(moves, [pos(4, 5), pos(6, 7), pos(8, 7)])
  })

  it.each([
    ObstacleTypes.CAVE,
    ObstacleTypes.RIVER,
    ObstacleTypes.LAKE,
    ObstacleTypes.CANYON,
    ObstacleTypes.TREE,
    ObstacleTypes.ROCK
  ])('is blocked by %s', (obstacle) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.MONARCH, color: 'white' })
    placeObstacle(board, pos(5, 5), obstacle)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).not.toContainEqual(pos(5, 5))
  })

  it.each(BOTH_COLORS)('attacks any adjacent enemy (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    placePiece(board, start, { type: PieceTypes.MONARCH, color })
    for (const target of adjacent(6, 5)) {
      placePiece(board, target, { type: PieceTypes.HOPLITE, color: enemy })
    }

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expectSamePositions(attacks, adjacent(6, 5))
  })

  it('does not attack at distance 2 or friendly pieces', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.MONARCH, color: 'white' })
    placePiece(board, pos(6, 7), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(6, 4), { type: PieceTypes.HOPLITE, color: 'white' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expectExcludesPositions(attacks, [pos(6, 7), pos(6, 4)])
  })
})
