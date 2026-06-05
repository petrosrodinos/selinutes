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

describe('Chariot', () => {
  it.each(BOTH_COLORS)('moves in the L / corner pattern (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectContainsPositions(moves, [
      pos(8, 6),
      pos(7, 7),
      pos(8, 7),
      pos(9, 6),
      pos(7, 8)
    ])
  })

  it('does not move like a rook or a king', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectExcludesPositions(moves, [pos(6, 6), pos(7, 6), pos(7, 5)])
  })

  it('jumps over pieces in its path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })
    placePiece(board, pos(7, 6), { type: PieceTypes.HOPLITE, color: 'white' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).toContainEqual(pos(8, 7))
  })

  it('can land beyond a river', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })
    placeObstacle(board, pos(8, 7), ObstacleTypes.RIVER)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).toContainEqual(pos(8, 7))
  })

  it.each([ObstacleTypes.LAKE, ObstacleTypes.CANYON, ObstacleTypes.CAVE])(
    'cannot land on %s target',
    (obstacle) => {
      const board = createEmptyBoard()
      const start = pos(6, 5)
      placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })
      placeObstacle(board, pos(8, 7), obstacle)

      const moves = getValidMoves(board, start, DEFAULT_SIZE)

      expect(moves).not.toContainEqual(pos(8, 7))
    }
  )

  it.each(BOTH_COLORS)('attacks an enemy on a clear gamma path (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color })
    placePiece(board, pos(9, 6), { type: PieceTypes.HOPLITE, color: enemy })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(9, 6))
  })

  it('does not attack an enemy off the gamma pattern', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })
    placePiece(board, pos(6, 7), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).not.toContainEqual(pos(6, 7))
  })

  it('cannot attack when both gamma paths are blocked by pieces', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })
    placePiece(board, pos(9, 6), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(8, 5), { type: PieceTypes.HOPLITE, color: 'white' })
    placePiece(board, pos(8, 6), { type: PieceTypes.HOPLITE, color: 'white' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).not.toContainEqual(pos(9, 6))
  })

  it('can shoot over a tree when the other gamma path is blocked', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })
    placePiece(board, pos(9, 6), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(8, 5), { type: PieceTypes.HOPLITE, color: 'white' })
    placeObstacle(board, pos(8, 6), ObstacleTypes.TREE)

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(9, 6))
  })
})
