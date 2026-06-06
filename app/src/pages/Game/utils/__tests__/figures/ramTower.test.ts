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

describe('Ram Tower', () => {
  it.each(BOTH_COLORS)('moves in a cross pattern any number of steps (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.RAM_TOWER, color })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectContainsPositions(moves, [
      pos(0, 5),
      pos(11, 5),
      pos(6, 0),
      pos(6, 11)
    ])
  })

  it('does not move diagonally', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.RAM_TOWER, color: 'white' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectExcludesPositions(moves, [pos(5, 4), pos(7, 6), pos(4, 3)])
  })

  it('move is blocked by impassable obstacle but stops before it', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.RAM_TOWER, color: 'white' })
    placeObstacle(board, pos(6, 7), ObstacleTypes.ROCK)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectContainsPositions(moves, [pos(6, 6)])
    expectExcludesPositions(moves, [pos(6, 7), pos(6, 8)])
  })

  it('passes and stops on a mystery box', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.RAM_TOWER, color: 'white' })
    placeObstacle(board, pos(6, 7), ObstacleTypes.MYSTERY_BOX)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectContainsPositions(moves, [pos(6, 6), pos(6, 7), pos(6, 8)])
  })

  it.each(BOTH_COLORS)('attacks along the cross up to range 5 (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    placePiece(board, start, { type: PieceTypes.RAM_TOWER, color })
    placePiece(board, pos(1, 5), { type: PieceTypes.HOPLITE, color: enemy })
    placePiece(board, pos(6, 10), { type: PieceTypes.HOPLITE, color: enemy })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expectContainsPositions(attacks, [pos(1, 5), pos(6, 10)])
  })

  it('does not attack beyond range 5 or off the cross', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.RAM_TOWER, color: 'white' })
    placePiece(board, pos(0, 5), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(4, 3), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expectExcludesPositions(attacks, [pos(0, 5), pos(4, 3)])
  })

  it('does not attack friendly pieces', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.RAM_TOWER, color: 'white' })
    placePiece(board, pos(6, 8), { type: PieceTypes.HOPLITE, color: 'white' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).not.toContainEqual(pos(6, 8))
  })

  it('shoots through a friendly piece to hit the first enemy', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.RAM_TOWER, color: 'white' })
    placePiece(board, pos(6, 7), { type: PieceTypes.HOPLITE, color: 'white' })
    placePiece(board, pos(6, 9), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(6, 9))
  })

  it('stops at the first enemy in the path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.RAM_TOWER, color: 'white' })
    placePiece(board, pos(6, 7), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(6, 9), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(6, 7))
    expect(attacks).not.toContainEqual(pos(6, 9))
  })

  it('zombie ram tower attack range is clamped to 1', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.RAM_TOWER, color: 'white', isZombie: true })
    placePiece(board, pos(6, 6), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(6, 8), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(6, 6))
    expect(attacks).not.toContainEqual(pos(6, 8))
  })
})
