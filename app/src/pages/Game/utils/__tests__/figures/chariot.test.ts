import { describe, it, expect } from 'vitest'
import {
  getValidMoves,
  getValidAttacks,
  isChariotValidCaptureMoveTarget,
  getDisplayedAttackTargets
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

  it.each(BOTH_COLORS)('range-kills an enemy only at the fourth gamma box (3+1) (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color })
    placePiece(board, pos(9, 6), { type: PieceTypes.HOPLITE, color: enemy })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(9, 6))
  })

  it('does not range-kill at 4+1 gamma (fifth box)', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const outOfRangeTarget = pos(10, 6)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })
    placePiece(board, outOfRangeTarget, { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).not.toContainEqual(outOfRangeTarget)
  })

  it.each([
    { target: pos(7, 6), label: '1+1 gamma' },
    { target: pos(8, 6), label: '2+1 gamma' }
  ])('does not range-kill at shorter gamma range ($label)', ({ target }) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })
    placePiece(board, target, { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).not.toContainEqual(target)
  })

  it('does not allow capture-and-move at gamma range 4 (3+1)', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const target = pos(9, 6)
    const chariot = { type: PieceTypes.CHARIOT, color: 'white' as const, id: 'c1', hasMoved: false }
    placePiece(board, start, chariot)
    placePiece(board, target, { type: PieceTypes.HOPLITE, color: 'black' })

    expect(isChariotValidCaptureMoveTarget(board, start, target, chariot, DEFAULT_SIZE)).toBe(false)
  })

  it('does not allow capture-and-move at gamma range 4 from f9 to e12 (3+1)', () => {
    const board = createEmptyBoard()
    const start = pos(8, 5)
    const target = pos(11, 4)
    const chariot = { type: PieceTypes.CHARIOT, color: 'white' as const, id: 'c1', hasMoved: false }
    placePiece(board, start, chariot)
    placePiece(board, target, { type: PieceTypes.WARLOCK, color: 'black' })

    expect(isChariotValidCaptureMoveTarget(board, start, target, chariot, DEFAULT_SIZE)).toBe(false)
  })

  it('does not allow capture-and-move at gamma range 5 (4+1)', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const target = pos(10, 6)
    const chariot = { type: PieceTypes.CHARIOT, color: 'white' as const, id: 'c1', hasMoved: false }
    placePiece(board, start, chariot)
    placePiece(board, target, { type: PieceTypes.HOPLITE, color: 'black' })

    expect(isChariotValidCaptureMoveTarget(board, start, target, chariot, DEFAULT_SIZE)).toBe(false)
  })

  it('allows capture-and-move at gamma range 3 (2+1)', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const target = pos(8, 6)
    const chariot = { type: PieceTypes.CHARIOT, color: 'white' as const, id: 'c1', hasMoved: false }
    placePiece(board, start, chariot)
    placePiece(board, target, { type: PieceTypes.HOPLITE, color: 'black' })

    expect(isChariotValidCaptureMoveTarget(board, start, target, chariot, DEFAULT_SIZE)).toBe(true)
  })

  it('does not range-kill an enemy off the gamma pattern', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })
    placePiece(board, pos(6, 7), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).not.toContainEqual(pos(6, 7))
  })

  it('can shoot over friendly figures on the fourth-box gamma path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })
    placePiece(board, pos(9, 6), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(8, 5), { type: PieceTypes.HOPLITE, color: 'white' })
    placePiece(board, pos(8, 6), { type: PieceTypes.HOPLITE, color: 'white' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toContainEqual(pos(9, 6))
  })

  it('cannot range-kill when an enemy blocks every fourth-box gamma path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })
    placePiece(board, pos(9, 6), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(7, 5), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(7, 6), { type: PieceTypes.HOPLITE, color: 'black' })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).not.toContainEqual(pos(9, 6))
  })

  it.each([ObstacleTypes.TREE, ObstacleTypes.LAKE, ObstacleTypes.CANYON, ObstacleTypes.CAVE])(
    'can shoot over %s on the fourth-box gamma path',
    (obstacle) => {
      const board = createEmptyBoard()
      const start = pos(6, 5)
      placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })
      placePiece(board, pos(9, 6), { type: PieceTypes.HOPLITE, color: 'black' })
      placeObstacle(board, pos(8, 6), obstacle)

      const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

      expect(attacks).toContainEqual(pos(9, 6))
    }
  )

  it('cannot shoot over rock on the fourth-box gamma path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.CHARIOT, color: 'white' })
    placePiece(board, pos(9, 6), { type: PieceTypes.HOPLITE, color: 'black' })
    placeObstacle(board, pos(8, 5), ObstacleTypes.ROCK)
    placeObstacle(board, pos(8, 6), ObstacleTypes.ROCK)

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).not.toContainEqual(pos(9, 6))
  })

  it('does not allow capture-and-move when a friendly figure is on the gamma path', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const target = pos(8, 6)
    const chariot = { type: PieceTypes.CHARIOT, color: 'white' as const, id: 'c1', hasMoved: false }
    placePiece(board, start, chariot)
    placePiece(board, target, { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(7, 6), { type: PieceTypes.HOPLITE, color: 'white' })

    expect(isChariotValidCaptureMoveTarget(board, start, target, chariot, DEFAULT_SIZE)).toBe(false)
  })

  it('allows capture-and-move when the gamma path is clear', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const target = pos(8, 6)
    const chariot = { type: PieceTypes.CHARIOT, color: 'white' as const, id: 'c1', hasMoved: false }
    placePiece(board, start, chariot)
    placePiece(board, target, { type: PieceTypes.HOPLITE, color: 'black' })

    expect(isChariotValidCaptureMoveTarget(board, start, target, chariot, DEFAULT_SIZE)).toBe(true)
  })

  it('highlights valid capture-and-move enemies in capture mode', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const chariot = { type: PieceTypes.CHARIOT, color: 'white' as const, id: 'c1', hasMoved: false }
    const clearTarget = pos(8, 6)
    placePiece(board, start, chariot)
    placePiece(board, clearTarget, { type: PieceTypes.HOPLITE, color: 'black' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)
    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)
    const displayed = getDisplayedAttackTargets(
      board,
      moves,
      attacks,
      chariot,
      start,
      'capture',
      DEFAULT_SIZE
    )

    expect(displayed).toContainEqual(clearTarget)
  })

  it('excludes gamma range 4 capture targets in capture mode (f9 to e12)', () => {
    const board = createEmptyBoard()
    const start = pos(8, 5)
    const chariot = { type: PieceTypes.CHARIOT, color: 'white' as const, id: 'c1', hasMoved: false }
    const outOfRangeTarget = pos(11, 4)
    placePiece(board, start, chariot)
    placePiece(board, outOfRangeTarget, { type: PieceTypes.WARLOCK, color: 'black' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)
    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)
    const displayed = getDisplayedAttackTargets(
      board,
      moves,
      attacks,
      chariot,
      start,
      'capture',
      DEFAULT_SIZE
    )

    expect(displayed).not.toContainEqual(outOfRangeTarget)
  })

  it('excludes blocked and out-of-range capture-and-move targets in capture mode', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const chariot = { type: PieceTypes.CHARIOT, color: 'white' as const, id: 'c1', hasMoved: false }
    const blockedTarget = pos(7, 7)
    const outOfCaptureRangeTarget = pos(9, 6)
    placePiece(board, start, chariot)
    placePiece(board, blockedTarget, { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, outOfCaptureRangeTarget, { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(7, 6), { type: PieceTypes.HOPLITE, color: 'white' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)
    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)
    const displayed = getDisplayedAttackTargets(
      board,
      moves,
      attacks,
      chariot,
      start,
      'capture',
      DEFAULT_SIZE
    )

    expect(displayed).not.toContainEqual(blockedTarget)
    expect(displayed).not.toContainEqual(outOfCaptureRangeTarget)
  })
})
