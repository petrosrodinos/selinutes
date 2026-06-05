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
  expectContainsPositions,
  expectExcludesPositions
} from '../helpers/boardFixtures'

describe('Warlock', () => {
  it.each(BOTH_COLORS)('moves in the 2-step corner pattern (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.WARLOCK, color })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectContainsPositions(moves, [
      pos(4, 5), pos(8, 5), pos(6, 3), pos(6, 7),
      pos(4, 3), pos(4, 7), pos(8, 3), pos(8, 7)
    ])
  })

  it('does not move single steps', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.WARLOCK, color: 'white' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectExcludesPositions(moves, [pos(5, 5), pos(6, 6), pos(5, 4)])
  })

  it('jumps over pieces in its path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.WARLOCK, color: 'white' })
    placePiece(board, pos(7, 5), { type: PieceTypes.HOPLITE, color: 'white' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).toContainEqual(pos(8, 5))
  })

  it.each([ObstacleTypes.LAKE, ObstacleTypes.CAVE])('can land on passable %s', (obstacle) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.WARLOCK, color: 'white' })
    placeObstacle(board, pos(6, 7), obstacle)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).toContainEqual(pos(6, 7))
  })

  it.each([ObstacleTypes.RIVER, ObstacleTypes.CANYON])('cannot land on %s', (obstacle) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.WARLOCK, color: 'white' })
    placeObstacle(board, pos(6, 7), obstacle)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).not.toContainEqual(pos(6, 7))
  })

  it.each(BOTH_COLORS)('attacks enemies one diagonal step away (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    placePiece(board, start, { type: PieceTypes.WARLOCK, color })
    placePiece(board, pos(5, 4), { type: PieceTypes.HOPLITE, color: enemy })
    placePiece(board, pos(7, 6), { type: PieceTypes.HOPLITE, color: enemy })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expectContainsPositions(attacks, [pos(5, 4), pos(7, 6)])
  })

  it('does not attack orthogonally or friendly pieces', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.WARLOCK, color: 'white' })
    placePiece(board, pos(6, 6), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(5, 4), { type: PieceTypes.HOPLITE, color: 'white' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expectExcludesPositions(attacks, [pos(6, 6), pos(5, 4)])
  })
})
