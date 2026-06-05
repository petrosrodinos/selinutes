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
  forwardDirection,
  opponentOf,
  expectSamePositions,
  expectContainsPositions,
  expectExcludesPositions
} from '../helpers/boardFixtures'

describe('Hoplite', () => {
  it.each(BOTH_COLORS)('moves 3 steps forward on first move (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color, hasMoved: false })
    const dir = forwardDirection(color)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectSamePositions(moves, [
      pos(6 + dir, 5),
      pos(6 + dir * 2, 5),
      pos(6 + dir * 3, 5)
    ])
  })

  it.each(BOTH_COLORS)('moves 2 steps forward after first move (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color, hasMoved: true })
    const dir = forwardDirection(color)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectSamePositions(moves, [
      pos(6 + dir, 5),
      pos(6 + dir * 2, 5)
    ])
  })

  it.each(BOTH_COLORS)('cannot move sideways or backward (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color, hasMoved: true })
    const dir = forwardDirection(color)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectExcludesPositions(moves, [
      pos(6, 4),
      pos(6, 6),
      pos(6 - dir, 5)
    ])
  })

  it.each(BOTH_COLORS)('attacks the two forward diagonals at range 1 (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color })
    const dir = forwardDirection(color)
    placePiece(board, pos(6 + dir, 4), { type: PieceTypes.HOPLITE, color: enemy })
    placePiece(board, pos(6 + dir, 6), { type: PieceTypes.HOPLITE, color: enemy })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expectSamePositions(attacks, [pos(6 + dir, 4), pos(6 + dir, 6)])
  })

  it.each(BOTH_COLORS)('does not attack friendly pieces on the forward diagonals (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color })
    const dir = forwardDirection(color)
    placePiece(board, pos(6 + dir, 4), { type: PieceTypes.HOPLITE, color })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toHaveLength(0)
  })

  it.each(BOTH_COLORS)('does not attack straight ahead (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color })
    const dir = forwardDirection(color)
    placePiece(board, pos(6 + dir, 5), { type: PieceTypes.HOPLITE, color: enemy })

    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(attacks).toHaveLength(0)
  })

  it('passes through cave and mystery box', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true })
    placeObstacle(board, pos(5, 5), ObstacleTypes.MYSTERY_BOX)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectContainsPositions(moves, [pos(5, 5), pos(4, 5)])
  })

  it.each([
    ObstacleTypes.RIVER,
    ObstacleTypes.LAKE,
    ObstacleTypes.CANYON,
    ObstacleTypes.TREE,
    ObstacleTypes.ROCK
  ])('is blocked by %s', (obstacle) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true })
    placeObstacle(board, pos(5, 5), obstacle)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectExcludesPositions(moves, [pos(5, 5), pos(4, 5)])
  })

  it('is blocked by a piece directly ahead', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true })
    placePiece(board, pos(5, 5), { type: PieceTypes.HOPLITE, color: 'white' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).toHaveLength(0)
  })

  it('zombie hoplite captures an enemy directly ahead', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true, isZombie: true })
    placePiece(board, pos(5, 5), { type: PieceTypes.HOPLITE, color: 'black' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).toContainEqual(pos(5, 5))
  })
})
