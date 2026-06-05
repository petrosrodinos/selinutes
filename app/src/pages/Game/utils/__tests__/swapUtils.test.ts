import { describe, it, expect } from 'vitest'
import { canInitiateSwap, getValidSwapTargets, isValidSwap, executeSwap } from '../swapUtils'
import { PieceTypes, isPiece } from '../../types'
import type { PlayerColor } from '../../types'
import { createEmptyBoard, placePiece, pos, BOTH_COLORS, opponentOf } from './helpers/boardFixtures'

describe('canInitiateSwap', () => {
  it('is true only for a warlock', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(5, 5), { type: PieceTypes.WARLOCK, color: 'white' })
    placePiece(board, pos(6, 6), { type: PieceTypes.HOPLITE, color: 'white' })

    expect(canInitiateSwap(board, pos(5, 5))).toBe(true)
    expect(canInitiateSwap(board, pos(6, 6))).toBe(false)
  })
})

describe('getValidSwapTargets', () => {
  it.each(BOTH_COLORS)('returns friendly monarchs and hoplites (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const enemy = opponentOf(color)
    const warlock = pos(5, 5)
    placePiece(board, warlock, { type: PieceTypes.WARLOCK, color })
    placePiece(board, pos(11, 5), { type: PieceTypes.MONARCH, color })
    placePiece(board, pos(8, 3), { type: PieceTypes.HOPLITE, color })
    placePiece(board, pos(8, 4), { type: PieceTypes.HOPLITE, color: enemy })

    const targets = getValidSwapTargets(board, warlock)
    const positions = targets.map(t => t.position)

    expect(positions).toContainEqual(pos(11, 5))
    expect(positions).toContainEqual(pos(8, 3))
    expect(positions).not.toContainEqual(pos(8, 4))
  })
})

describe('isValidSwap', () => {
  it('rejects a non-warlock initiator', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(5, 5), { type: PieceTypes.HOPLITE, color: 'white' })
    placePiece(board, pos(11, 5), { type: PieceTypes.MONARCH, color: 'white' })

    expect(isValidSwap(board, pos(5, 5), pos(11, 5)).valid).toBe(false)
  })

  it('rejects an enemy target', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(5, 5), { type: PieceTypes.WARLOCK, color: 'white' })
    placePiece(board, pos(11, 5), { type: PieceTypes.MONARCH, color: 'black' })

    expect(isValidSwap(board, pos(5, 5), pos(11, 5)).valid).toBe(false)
  })

  it('rejects an invalid target type', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(5, 5), { type: PieceTypes.WARLOCK, color: 'white' })
    placePiece(board, pos(11, 5), { type: PieceTypes.RAM_TOWER, color: 'white' })

    expect(isValidSwap(board, pos(5, 5), pos(11, 5)).valid).toBe(false)
  })

  it('accepts a monarch and a hoplite target', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(5, 5), { type: PieceTypes.WARLOCK, color: 'white' })
    placePiece(board, pos(11, 5), { type: PieceTypes.MONARCH, color: 'white' })
    placePiece(board, pos(8, 3), { type: PieceTypes.HOPLITE, color: 'white' })

    expect(isValidSwap(board, pos(5, 5), pos(11, 5))).toMatchObject({ valid: true, swapType: 'warlock-monarch' })
    expect(isValidSwap(board, pos(5, 5), pos(8, 3))).toMatchObject({ valid: true, swapType: 'hoplite-monarch' })
  })
})

describe('executeSwap', () => {
  it.each(BOTH_COLORS)('swaps a warlock and a monarch directly (%s)', (color: PlayerColor) => {
    const board = createEmptyBoard()
    const warlock = pos(5, 5)
    const monarch = pos(11, 5)
    placePiece(board, warlock, { type: PieceTypes.WARLOCK, color })
    placePiece(board, monarch, { type: PieceTypes.MONARCH, color })

    const result = executeSwap(board, warlock, monarch)
    const atWarlock = result.board[5][5]
    const atMonarch = result.board[11][5]

    expect(result.success).toBe(true)
    expect(isPiece(atWarlock) && atWarlock.type).toBe(PieceTypes.MONARCH)
    expect(isPiece(atMonarch) && atMonarch.type).toBe(PieceTypes.WARLOCK)
  })

  it('swaps a hoplite with the monarch and leaves the warlock in place', () => {
    const board = createEmptyBoard()
    const warlock = pos(5, 5)
    const hoplite = pos(8, 3)
    const monarch = pos(11, 5)
    placePiece(board, warlock, { type: PieceTypes.WARLOCK, color: 'white' })
    placePiece(board, hoplite, { type: PieceTypes.HOPLITE, color: 'white' })
    placePiece(board, monarch, { type: PieceTypes.MONARCH, color: 'white' })

    const result = executeSwap(board, warlock, hoplite)
    const atHoplite = result.board[8][3]
    const atMonarch = result.board[11][5]
    const atWarlock = result.board[5][5]

    expect(result.success).toBe(true)
    expect(isPiece(atHoplite) && atHoplite.type).toBe(PieceTypes.MONARCH)
    expect(isPiece(atMonarch) && atMonarch.type).toBe(PieceTypes.HOPLITE)
    expect(isPiece(atWarlock) && atWarlock.type).toBe(PieceTypes.WARLOCK)
  })
})
