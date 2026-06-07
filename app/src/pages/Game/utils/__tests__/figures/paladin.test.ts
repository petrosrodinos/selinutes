import { describe, it, expect } from 'vitest'
import {
  getValidMoves,
  getValidAttacks,
  getDisplayedAttackTargets,
  resolveAttackModeAction
} from '../../moveUtils'
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

describe('Paladin', () => {
  it.each(BOTH_COLORS)('moves diagonally any number of steps (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectContainsPositions(moves, [pos(5, 4), pos(4, 3), pos(7, 6), pos(8, 7), pos(5, 6), pos(7, 4)])
  })

  it('does not move orthogonally', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color: 'white' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectExcludesPositions(moves, [pos(6, 6), pos(7, 5), pos(5, 5)])
  })

  it('passes a 1-wide river', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color: 'white' })
    placeObstacle(board, pos(5, 4), ObstacleTypes.RIVER)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).toContainEqual(pos(4, 3))
  })

  it('is blocked by a 2-wide river', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color: 'white' })
    placeObstacle(board, pos(5, 4), ObstacleTypes.RIVER)
    placeObstacle(board, pos(4, 3), ObstacleTypes.RIVER)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).not.toContainEqual(pos(3, 2))
  })

  it('passes through canyon', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color: 'white' })
    placeObstacle(board, pos(5, 4), ObstacleTypes.CANYON)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).toContainEqual(pos(4, 3))
  })

  it('is blocked by lake', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color: 'white' })
    placeObstacle(board, pos(5, 4), ObstacleTypes.LAKE)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectExcludesPositions(moves, [pos(5, 4), pos(4, 3)])
  })

  it.each(BOTH_COLORS)('attacks diagonally up to range 3 (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    placePiece(board, start, { type: PieceTypes.PALADIN, color })
    placePiece(board, pos(3, 2), { type: PieceTypes.HOPLITE, color: enemy })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(3, 2))
  })

  it('does not attack beyond range 3', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color: 'white' })
    placePiece(board, pos(2, 1), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).not.toContainEqual(pos(2, 1))
  })

  it('does not attack orthogonally', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color: 'white' })
    placePiece(board, pos(6, 8), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).not.toContainEqual(pos(6, 8))
  })

  it('shoots through a friendly piece to hit the first enemy', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color: 'white' })
    placePiece(board, pos(5, 4), { type: PieceTypes.HOPLITE, color: 'white' })
    placePiece(board, pos(3, 2), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(3, 2))
  })

  it('stops at the first enemy in the path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color: 'white' })
    placePiece(board, pos(4, 3), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(3, 2), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(4, 3))
    expect(attacks).not.toContainEqual(pos(3, 2))
  })

  it('can move-capture an enemy beyond ranged attack distance', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color: 'white' })
    placePiece(board, pos(2, 1), { type: PieceTypes.HOPLITE, color: 'black' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).toContainEqual(pos(2, 1))
  })

  it('does not move-capture when a friendly blocks the diagonal path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color: 'white' })
    placePiece(board, pos(4, 3), { type: PieceTypes.HOPLITE, color: 'white' })
    placePiece(board, pos(2, 1), { type: PieceTypes.HOPLITE, color: 'black' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).not.toContainEqual(pos(2, 1))
  })

  it('highlights distant enemies for capture mode', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const paladin = { type: PieceTypes.PALADIN, color: 'white' as const }
    placePiece(board, start, paladin)
    placePiece(board, pos(2, 1), { type: PieceTypes.HOPLITE, color: 'black' })

    const validMoves = getValidMoves(board, start, DEFAULT_SIZE)
    const validAttacks = getValidAttacks(board, start, DEFAULT_SIZE)
    const displayed = getDisplayedAttackTargets(
      board,
      validMoves,
      validAttacks,
      paladin,
      start,
      'capture',
      DEFAULT_SIZE
    )

    expect(displayed).toContainEqual(pos(2, 1))
    expect(validAttacks).not.toContainEqual(pos(2, 1))
  })

  it('allows move-capture beyond ranged attack distance in capture mode', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const target = pos(2, 1)
    const paladin = { type: PieceTypes.PALADIN, color: 'white' as const }
    placePiece(board, start, paladin)
    const enemy = { type: PieceTypes.HOPLITE, color: 'black' as const }
    placePiece(board, target, enemy)

    const validMoves = getValidMoves(board, start, DEFAULT_SIZE)
    const validAttacks = getValidAttacks(board, start, DEFAULT_SIZE)
    const isValidMoveTarget = validMoves.some(move => move.row === target.row && move.col === target.col)
    const isValidAttackTarget = validAttacks.some(attack => attack.row === target.row && attack.col === target.col)

    const result = resolveAttackModeAction(
      paladin,
      enemy,
      isValidMoveTarget,
      isValidAttackTarget,
      'capture'
    )

    expect(result).toEqual({
      allowed: true,
      shouldUseRangedAttack: false,
      shouldUseMoveCapture: true
    })
  })

  it('zombie paladin attack range is clamped to 1', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color: 'white', isZombie: true })
    placePiece(board, pos(5, 4), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(8, 3), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(5, 4))
    expect(attacks).not.toContainEqual(pos(8, 3))
  })

  it('can shoot over rock and lake but not tree on the diagonal attack path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.PALADIN, color: 'white' })
    placePiece(board, pos(3, 2), { type: PieceTypes.HOPLITE, color: 'black' })
    placeObstacle(board, pos(5, 4), ObstacleTypes.ROCK)
    placeObstacle(board, pos(4, 3), ObstacleTypes.LAKE)

    expect(getValidAttacks(board, start, DEFAULT_SIZE)).toContainEqual(pos(3, 2))

    placeObstacle(board, pos(5, 4), ObstacleTypes.TREE)

    expect(getValidAttacks(board, start, DEFAULT_SIZE)).not.toContainEqual(pos(3, 2))
  })
})
