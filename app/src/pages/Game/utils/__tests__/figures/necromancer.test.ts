import { describe, it, expect } from 'vitest'
import {
  getValidMoves,
  getValidAttacks,
  getNecromancerKillTargets,
  getNecromancerFreezeTargets,
  applyNecromancerFreeze
} from '../../moveUtils'
import { PieceTypes, ObstacleTypes, isPiece } from '../../../types'
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

describe('Necromancer', () => {
  it.each(BOTH_COLORS)('moves one step in any direction (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectSamePositions(moves, adjacent(6, 5))
  })

  it('does not move more than one step', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color: 'white' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expectExcludesPositions(moves, [pos(4, 5), pos(6, 7), pos(8, 7)])
  })

  it.each([ObstacleTypes.CAVE, ObstacleTypes.LAKE])('can land on passable %s', (obstacle) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color: 'white' })
    placeObstacle(board, pos(5, 5), obstacle)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).toContainEqual(pos(5, 5))
  })

  it.each([ObstacleTypes.RIVER, ObstacleTypes.CANYON])('is blocked by %s', (obstacle) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color: 'white' })
    placeObstacle(board, pos(5, 5), obstacle)

    const moves = getValidMoves(board, start, DEFAULT_SIZE)

    expect(moves).not.toContainEqual(pos(5, 5))
  })

  it.each(BOTH_COLORS)('melee kills adjacent enemies only (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const enemy = opponentOf(color)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color })
    placePiece(board, pos(5, 5), { type: PieceTypes.HOPLITE, color: enemy })
    placePiece(board, pos(6, 4), { type: PieceTypes.HOPLITE, color })

    const kills = getNecromancerKillTargets(board, start, DEFAULT_SIZE)
    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)

    expect(kills).toContainEqual(pos(5, 5))
    expect(kills).not.toContainEqual(pos(6, 4))
    expect(attacks).toContainEqual(pos(5, 5))
  })

  it('freezes an aligned enemy within range 8', () => {
    const board = createEmptyBoard()
    const start = pos(9, 5)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color: 'white', reviveCount: 0 })
    placePiece(board, pos(1, 5), { type: PieceTypes.HOPLITE, color: 'black' })

    const targets = getNecromancerFreezeTargets(board, start, DEFAULT_SIZE)

    expect(targets).toContainEqual(pos(1, 5))
  })

  it('freeze line of sight is blocked by rock', () => {
    const board = createEmptyBoard()
    const start = pos(9, 5)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color: 'white' })
    placePiece(board, pos(1, 5), { type: PieceTypes.HOPLITE, color: 'black' })
    placeObstacle(board, pos(5, 5), ObstacleTypes.ROCK)

    expect(getNecromancerFreezeTargets(board, start, DEFAULT_SIZE)).not.toContainEqual(pos(1, 5))
  })

  it('freeze line of sight passes over a tree', () => {
    const board = createEmptyBoard()
    const start = pos(9, 5)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color: 'white' })
    placePiece(board, pos(1, 5), { type: PieceTypes.HOPLITE, color: 'black' })
    placeObstacle(board, pos(5, 5), ObstacleTypes.TREE)

    expect(getNecromancerFreezeTargets(board, start, DEFAULT_SIZE)).toContainEqual(pos(1, 5))
  })

  it('freeze line of sight passes over a mystery box', () => {
    const board = createEmptyBoard()
    const start = pos(9, 5)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color: 'white' })
    placePiece(board, pos(1, 5), { type: PieceTypes.HOPLITE, color: 'black' })
    placeObstacle(board, pos(5, 5), ObstacleTypes.MYSTERY_BOX)

    expect(getNecromancerFreezeTargets(board, start, DEFAULT_SIZE)).toContainEqual(pos(1, 5))
  })

  it('does not freeze a non-aligned enemy', () => {
    const board = createEmptyBoard()
    const start = pos(9, 5)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color: 'white' })
    placePiece(board, pos(1, 6), { type: PieceTypes.HOPLITE, color: 'black' })

    const targets = getNecromancerFreezeTargets(board, start, DEFAULT_SIZE)

    expect(targets).not.toContainEqual(pos(1, 6))
  })

  it('freeze range shrinks by 2 per revive', () => {
    const board = createEmptyBoard()
    const start = pos(9, 5)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color: 'white', reviveCount: 3 })
    placePiece(board, pos(7, 5), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(6, 5), { type: PieceTypes.HOPLITE, color: 'black' })

    const targets = getNecromancerFreezeTargets(board, start, DEFAULT_SIZE)

    expect(targets).toContainEqual(pos(7, 5))
    expect(targets).not.toContainEqual(pos(6, 5))
  })

  it('cannot freeze after four revivals', () => {
    const board = createEmptyBoard()
    const start = pos(9, 5)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color: 'white', reviveCount: 4 })
    placePiece(board, pos(8, 5), { type: PieceTypes.HOPLITE, color: 'black' })

    expect(getNecromancerFreezeTargets(board, start, DEFAULT_SIZE)).toHaveLength(0)
  })

  it('does not freeze adjacent enemies', () => {
    const board = createEmptyBoard()
    const start = pos(9, 5)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color: 'white' })
    placePiece(board, pos(8, 5), { type: PieceTypes.HOPLITE, color: 'black' })

    expect(getNecromancerFreezeTargets(board, start, DEFAULT_SIZE)).not.toContainEqual(pos(8, 5))
  })

  it.each([
    { reviveCount: 0, to: pos(1, 5), expectedTurns: 4 },
    { reviveCount: 1, to: pos(3, 5), expectedTurns: 3 },
    { reviveCount: 2, to: pos(5, 5), expectedTurns: 2 },
    { reviveCount: 3, to: pos(7, 5), expectedTurns: 1 }
  ])('applyNecromancerFreeze sets frozenTurns from max freeze range divided by 2 ($expectedTurns turns after $reviveCount revivals)', ({ reviveCount, to, expectedTurns }) => {
    const from = pos(9, 5)
    const board = createEmptyBoard()
    placePiece(board, from, { type: PieceTypes.NECROMANCER, color: 'white', reviveCount })
    placePiece(board, to, { type: PieceTypes.HOPLITE, color: 'black' })

    const { newBoard, move } = applyNecromancerFreeze(board, from, to, DEFAULT_SIZE)
    const target = newBoard[to.row][to.col]

    expect(move.isFreeze).toBe(true)
    expect(move.freezeTurns).toBe(expectedTurns)
    expect(isPiece(target) && target.frozenTurns).toBe(expectedTurns)
  })

  it('freeze duration is the same regardless of target distance', () => {
    const from = pos(9, 5)
    const board = createEmptyBoard()
    placePiece(board, from, { type: PieceTypes.NECROMANCER, color: 'white', reviveCount: 0 })
    placePiece(board, pos(1, 5), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(7, 5), { type: PieceTypes.HOPLITE, color: 'black' })

    const farFreeze = applyNecromancerFreeze(board, from, pos(1, 5), DEFAULT_SIZE)
    const nearFreeze = applyNecromancerFreeze(board, from, pos(7, 5), DEFAULT_SIZE)

    expect(farFreeze.move.freezeTurns).toBe(4)
    expect(nearFreeze.move.freezeTurns).toBe(4)
  })

  it('a frozen piece cannot move but can still range attack', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    placePiece(board, start, { type: PieceTypes.RAM_TOWER, color: 'white', frozenTurns: 1 })
    placePiece(board, pos(6, 7), { type: PieceTypes.HOPLITE, color: 'black' })

    expect(getValidMoves(board, start, DEFAULT_SIZE)).toHaveLength(0)
    expect(getValidAttacks(board, start, DEFAULT_SIZE)).toContainEqual({ row: 6, col: 7 })
  })

  it('a frozen necromancer can melee kill but cannot freeze', () => {
    const board = createEmptyBoard()
    const start = pos(9, 5)
    placePiece(board, start, { type: PieceTypes.NECROMANCER, color: 'white', frozenTurns: 1 })
    placePiece(board, pos(8, 5), { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, pos(1, 5), { type: PieceTypes.HOPLITE, color: 'black' })

    expect(getNecromancerKillTargets(board, start, DEFAULT_SIZE)).toContainEqual({ row: 8, col: 5 })
    expect(getNecromancerFreezeTargets(board, start, DEFAULT_SIZE)).toHaveLength(0)
  })
})
