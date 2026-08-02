import { describe, it, expect } from 'vitest'
import {
  getValidMoves,
  getValidAttacks,
  getDisplayedAttackTargets,
  getCaptureMoveTargets,
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
  expectContainsPositions
} from '../helpers/boardFixtures'

describe('Duchess', () => {
  it.each(BOTH_COLORS)('moves any number of steps in any direction (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectContainsPositions(moves, [pos(0, 5), pos(11, 5), pos(6, 0), pos(6, 11), pos(0, 11), pos(11, 0)])
  })

  it('passes through river', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color: 'white' })
    placeObstacle(board, pos(5, 5), ObstacleTypes.RIVER)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectContainsPositions(moves, [pos(4, 5), pos(3, 5)])
  })

  it.each([ObstacleTypes.LAKE, ObstacleTypes.CANYON, ObstacleTypes.CAVE, ObstacleTypes.TREE])(
    'is blocked by %s',
    (obstacle) => {
      const board = createEmptyBoard()
      const start = pos(6, 5)
      placePiece(board, start, { type: PieceTypes.DUCHESS, color: 'white' })
      placeObstacle(board, pos(5, 5), obstacle)

      const moves = getValidMoves(board, start, DEFAULT_SIZE)

      expect(moves).not.toContainEqual(pos(4, 5))
    }
  )

  it.each(BOTH_COLORS)('shoots through a friendly piece to hit an enemy (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color })
    placePiece(board, pos(6, 7), { type: PieceTypes.HOPLITE, color })
    placePiece(board, pos(6, 9), { type: PieceTypes.HOPLITE, color: enemy })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(6, 9))
  })

  it('stops at the first enemy in the path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color: 'white' })
    placePiece(board, pos(6, 7), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(6, 9), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(6, 7))
    expect(attacks).not.toContainEqual(pos(6, 9))
  })

  it('cannot shoot through a lake', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color: 'white' })
    placeObstacle(board, pos(6, 7), ObstacleTypes.LAKE)
    placePiece(board, pos(6, 9), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(6, 9))
  })

  it('cannot shoot through a tree', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color: 'white' })
    placeObstacle(board, pos(6, 7), ObstacleTypes.TREE)
    placePiece(board, pos(6, 9), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).not.toContainEqual(pos(6, 9))
  })

  it('can shoot over rock and cave on the attack path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color: 'white' })
    placeObstacle(board, pos(6, 7), ObstacleTypes.ROCK)
    placeObstacle(board, pos(6, 8), ObstacleTypes.CAVE)
    placePiece(board, pos(6, 9), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(6, 9))
  })

  it('can shoot over a mystery box on the attack path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color: 'white' })
    placeObstacle(board, pos(6, 7), ObstacleTypes.MYSTERY_BOX)
    placePiece(board, pos(6, 9), { type: PieceTypes.HOPLITE, color: 'black' })

    expect(getValidAttacks(board, start, DEFAULT_SIZE)).toContainEqual(pos(6, 9))
  })

  it('attacks up to range 9 but not beyond', () => {
    const board = createEmptyBoard()
    const start = pos(11, 0)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color: 'white' })
    placePiece(board, pos(11, 9), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(11, 9))
  })

  it('does not attack beyond range 9', () => {
    const board = createEmptyBoard()
    const start = pos(11, 0)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color: 'white' })
    placePiece(board, pos(11, 11), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).not.toContainEqual(pos(11, 11))
  })

  it('does not attack friendly pieces', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color: 'white' })
    placePiece(board, pos(6, 8), { type: PieceTypes.HOPLITE, color: 'white' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).not.toContainEqual(pos(6, 8))
  })

  it('can move-capture an enemy on a clear path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color: 'white' })
    placePiece(board, pos(6, 9), { type: PieceTypes.HOPLITE, color: 'black' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).toContainEqual(pos(6, 9))
  })

  it('does not move-capture when a friendly blocks the path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color: 'white' })
    placePiece(board, pos(6, 7), { type: PieceTypes.HOPLITE, color: 'white' })
    placePiece(board, pos(6, 9), { type: PieceTypes.HOPLITE, color: 'black' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).not.toContainEqual(pos(6, 9))
  })

  it('does not move-capture through an impassable obstacle', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.DUCHESS, color: 'white' })
    placeObstacle(board, pos(6, 7), ObstacleTypes.LAKE)
    placePiece(board, pos(6, 9), { type: PieceTypes.HOPLITE, color: 'black' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).not.toContainEqual(pos(6, 9))
  })

  it('highlights clear-path enemies for capture mode', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const duchess = { type: PieceTypes.DUCHESS, color: 'white' as const, id: 'duchess-1' }
    placePiece(board, start, duchess)
    placePiece(board, pos(6, 9), { type: PieceTypes.HOPLITE, color: 'black' })

    const validMoves = getValidMoves(board, start, DEFAULT_SIZE)
    const validAttacks = getValidAttacks(board, start, DEFAULT_SIZE)
    const displayed = getDisplayedAttackTargets(
      board,
      validMoves,
      validAttacks,
      duchess,
      start,
      'capture',
      DEFAULT_SIZE
    )

    expect(getCaptureMoveTargets(board, validMoves, duchess, start, DEFAULT_SIZE)).toContainEqual(pos(6, 9))
    expect(displayed).toContainEqual(pos(6, 9))
  })

  it('allows move-capture in capture mode', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const target = pos(6, 9)
    const duchess = { type: PieceTypes.DUCHESS, color: 'white' as const, id: 'duchess-1' }
    placePiece(board, start, duchess)
    const enemy = { type: PieceTypes.HOPLITE, color: 'black' as const, id: 'hoplite-enemy' }
    placePiece(board, target, enemy)

    const validMoves = getValidMoves(board, start, DEFAULT_SIZE)
    const validAttacks = getValidAttacks(board, start, DEFAULT_SIZE)
    const isValidMoveTarget = validMoves.some(move => move.row === target.row && move.col === target.col)
    const isValidAttackTarget = validAttacks.some(attack => attack.row === target.row && attack.col === target.col)

    const result = resolveAttackModeAction(
      duchess,
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
})
