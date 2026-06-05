import { describe, it, expect } from 'vitest'
import { getValidMoves, getValidAttacks } from '../../moveUtils'
import { createNarcsForBomber, checkNarcNetTrigger } from '../../narcUtils'
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

describe('Bomber', () => {
  it.each(BOTH_COLORS)('moves 1 or 2 steps in cross and X patterns (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.BOMBER, color })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectContainsPositions(moves, [
      pos(5, 5), pos(7, 5), pos(6, 4), pos(6, 6),
      pos(5, 4), pos(7, 6),
      pos(4, 5), pos(8, 5), pos(6, 3), pos(6, 7),
      pos(4, 3), pos(8, 7)
    ])
  })

  it('does not move 3 steps or in knight shapes', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.BOMBER, color: 'white' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectExcludesPositions(moves, [pos(6, 8), pos(3, 5), pos(7, 3)])
  })

  it.each([ObstacleTypes.CAVE, ObstacleTypes.RIVER, ObstacleTypes.CANYON])(
    'can land on passable %s',
    (obstacle) => {
      const board = createEmptyBoard()
      const start = pos(6, 5)
      placePiece(board, start, { type: PieceTypes.BOMBER, color: 'white' })
      placeObstacle(board, pos(6, 7), obstacle)

      const moves = getValidMoves(board, start, DEFAULT_SIZE)

      expect(moves).toContainEqual(pos(6, 7))
    }
  )

  it('is blocked by lake target', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.BOMBER, color: 'white' })
    placeObstacle(board, pos(6, 7), ObstacleTypes.LAKE)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).not.toContainEqual(pos(6, 7))
  })

  it.each(BOTH_COLORS)('has no direct attacks (attackRange 0) (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    placePiece(board, start, { type: PieceTypes.BOMBER, color })
    placePiece(board, pos(6, 6), { type: PieceTypes.HOPLITE, color: enemy })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toHaveLength(0)
  })

  it('creates narcs on empty cells around it', () => {
    const board = createEmptyBoard()
    const bomberPos = pos(6, 5)
    placePiece(board, bomberPos, { type: PieceTypes.BOMBER, color: 'white' })

    const narcs = createNarcsForBomber(bomberPos, 'white', 'bomber-1', board, DEFAULT_SIZE, [])

    expect(narcs).toHaveLength(12)
    expect(narcs.every(n => n.ownerColor === 'white' && n.bomberId === 'bomber-1')).toBe(true)
  })

  it('does not create a narc on an occupied cell', () => {
    const board = createEmptyBoard()
    const bomberPos = pos(6, 5)
    placePiece(board, bomberPos, { type: PieceTypes.BOMBER, color: 'white' })
    placePiece(board, pos(5, 4), { type: PieceTypes.HOPLITE, color: 'white' })

    const narcs = createNarcsForBomber(bomberPos, 'white', 'bomber-1', board, DEFAULT_SIZE, [])

    expect(narcs.some(n => n.position.row === 5 && n.position.col === 4)).toBe(false)
  })

  it('a moved bomber forms a narc net that triggers on enemy entry only', () => {
    const board = createEmptyBoard()
    const bomberPos = pos(6, 5)
    placePiece(board, bomberPos, { type: PieceTypes.BOMBER, color: 'white', hasMoved: true })
    const netCell = pos(4, 5)

    expect(checkNarcNetTrigger(board, DEFAULT_SIZE, netCell, 'black')).toBeDefined()
    expect(checkNarcNetTrigger(board, DEFAULT_SIZE, netCell, 'white')).toBeUndefined()
  })
})
