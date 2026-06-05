import { describe, it, expect } from 'vitest'
import {
  rollDice,
  getRandomMysteryBoxOption,
  executeFigureSwap,
  executeHopliteSacrifice,
  executeRevivePiece,
  executeObstacleSwap,
  canPlayerUseMysteryBoxOption1,
  canPlayerUseMysteryBoxOption2,
  canPlayerUseMysteryBoxOption3,
  getPhaseForOption,
  isObstacleSwapPlacementRowDisabled
} from '../mysteryBoxUtils'
import { PieceTypes, ObstacleTypes, MysteryBoxOptions, MysteryBoxPhases, isPiece, isObstacle } from '../../types'
import type { Piece } from '../../types'
import { createEmptyBoard, placePiece, placeObstacle, pos } from './helpers/boardFixtures'

describe('rollDice', () => {
  it('always returns a value between 1 and 6', () => {
    for (let i = 0; i < 200; i++) {
      const roll = rollDice()
      expect(roll).toBeGreaterThanOrEqual(1)
      expect(roll).toBeLessThanOrEqual(6)
    }
  })
})

describe('getRandomMysteryBoxOption', () => {
  it('returns OBSTACLE_SWAP (current behavior)', () => {
    expect(getRandomMysteryBoxOption('white', { white: [], black: [] })).toBe(MysteryBoxOptions.OBSTACLE_SWAP)
  })
})

describe('executeFigureSwap', () => {
  it('swaps the contents of two cells', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(3, 3), { type: PieceTypes.HOPLITE, color: 'white', id: 'a' })
    placePiece(board, pos(7, 7), { type: PieceTypes.RAM_TOWER, color: 'white', id: 'b' })

    const { success, newBoard } = executeFigureSwap(board, pos(3, 3), pos(7, 7))
    const a = newBoard[3][3]
    const b = newBoard[7][7]

    expect(success).toBe(true)
    expect(isPiece(a) && a.id).toBe('b')
    expect(isPiece(b) && b.id).toBe('a')
  })
})

describe('executeHopliteSacrifice', () => {
  it('removes the sacrificed hoplite', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(4, 4), { type: PieceTypes.HOPLITE, color: 'white' })

    const { success, newBoard } = executeHopliteSacrifice(board, pos(4, 4))

    expect(success).toBe(true)
    expect(newBoard[4][4]).toBeNull()
  })
})

describe('executeRevivePiece', () => {
  it('places the revived piece on the board', () => {
    const board = createEmptyBoard()
    const piece: Piece = { id: 'r1', type: PieceTypes.CHARIOT, color: 'white', hasMoved: false }

    const { success, newBoard } = executeRevivePiece(board, piece, pos(6, 6))
    const placed = newBoard[6][6]

    expect(success).toBe(true)
    expect(isPiece(placed) && placed.id).toBe('r1')
  })
})

describe('executeObstacleSwap', () => {
  it('fails when the counts do not match', () => {
    const board = createEmptyBoard()
    placeObstacle(board, pos(5, 3), ObstacleTypes.ROCK)

    const result = executeObstacleSwap(board, [pos(5, 3)], [pos(6, 7), pos(6, 8)])

    expect(result.success).toBe(false)
  })

  it('fails when placing on a disabled row', () => {
    const board = createEmptyBoard()
    placeObstacle(board, pos(5, 3), ObstacleTypes.ROCK)

    const result = executeObstacleSwap(board, [pos(5, 3)], [pos(2, 7)])

    expect(result.success).toBe(false)
  })

  it('moves the obstacle to the chosen empty tile', () => {
    const board = createEmptyBoard()
    placeObstacle(board, pos(5, 3), ObstacleTypes.ROCK)

    const { success, newBoard } = executeObstacleSwap(board, [pos(5, 3)], [pos(6, 7)])
    const moved = newBoard[6][7]

    expect(success).toBe(true)
    expect(newBoard[5][3]).toBeNull()
    expect(isObstacle(moved) && moved.type).toBe(ObstacleTypes.ROCK)
  })
})

describe('mystery box availability checks', () => {
  it('option 1 needs at least two figures', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(3, 3), { type: PieceTypes.HOPLITE, color: 'white' })
    expect(canPlayerUseMysteryBoxOption1(board, 'white')).toBe(false)
    placePiece(board, pos(3, 4), { type: PieceTypes.HOPLITE, color: 'white' })
    expect(canPlayerUseMysteryBoxOption1(board, 'white')).toBe(true)
  })

  it('option 2 needs a hoplite and a revivable captured piece', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(3, 3), { type: PieceTypes.HOPLITE, color: 'white' })
    const captured = { white: [{ id: 'c', type: PieceTypes.CHARIOT, color: 'white', hasMoved: false } as Piece], black: [] }

    expect(canPlayerUseMysteryBoxOption2(board, 'white', captured)).toBe(true)
    expect(canPlayerUseMysteryBoxOption2(board, 'white', { white: [], black: [] })).toBe(false)
  })

  it('option 3 needs a selectable obstacle and an allowed empty tile', () => {
    const board = createEmptyBoard()
    expect(canPlayerUseMysteryBoxOption3(board)).toBe(false)
    placeObstacle(board, pos(5, 3), ObstacleTypes.ROCK)
    expect(canPlayerUseMysteryBoxOption3(board)).toBe(true)
  })
})

describe('getPhaseForOption', () => {
  it('maps each option to its starting phase', () => {
    expect(getPhaseForOption(MysteryBoxOptions.FIGURE_SWAP)).toBe(MysteryBoxPhases.WAITING_FIRST_FIGURE)
    expect(getPhaseForOption(MysteryBoxOptions.HOPLITE_SACRIFICE_REVIVE)).toBe(MysteryBoxPhases.WAITING_HOPLITE_SACRIFICE)
    expect(getPhaseForOption(MysteryBoxOptions.OBSTACLE_SWAP)).toBe(MysteryBoxPhases.WAITING_OBSTACLE_SELECTION)
  })
})

describe('isObstacleSwapPlacementRowDisabled', () => {
  it('disables row 2 and the third-from-last row', () => {
    expect(isObstacleSwapPlacementRowDisabled(2, 12)).toBe(true)
    expect(isObstacleSwapPlacementRowDisabled(9, 12)).toBe(true)
    expect(isObstacleSwapPlacementRowDisabled(6, 12)).toBe(false)
  })
})
