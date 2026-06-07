import { describe, it, expect } from 'vitest'
import {
  HOPLITE_PROMOTION_MAX,
  getEnemyBackRow,
  isOnEnemyBackRow,
  countHoplitePromotions,
  canPromoteHoplite,
  promoteHopliteToDuchess
} from '../hoplitePromotionUtils'
import { PieceTypes, PlayerColors } from '../../types'
import { createEmptyBoard, placePiece, pos, DEFAULT_SIZE } from './helpers/boardFixtures'

describe('hoplitePromotionUtils', () => {
  it('uses row 0 as the enemy back row for white', () => {
    expect(getEnemyBackRow(PlayerColors.WHITE, DEFAULT_SIZE)).toBe(0)
    expect(isOnEnemyBackRow(pos(0, 3), PlayerColors.WHITE, DEFAULT_SIZE)).toBe(true)
    expect(isOnEnemyBackRow(pos(1, 3), PlayerColors.WHITE, DEFAULT_SIZE)).toBe(false)
  })

  it('uses the last row as the enemy back row for black', () => {
    expect(getEnemyBackRow(PlayerColors.BLACK, DEFAULT_SIZE)).toBe(11)
    expect(isOnEnemyBackRow(pos(11, 3), PlayerColors.BLACK, DEFAULT_SIZE)).toBe(true)
  })

  it('counts all promoted duchesses on the board and in captured lists', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(0, 0), { type: PieceTypes.DUCHESS, color: 'white', promotedFromHoplite: true })
    placePiece(board, pos(0, 1), { type: PieceTypes.DUCHESS, color: 'white' })

    const captured = {
      white: [{ id: 'c1', type: PieceTypes.DUCHESS, color: 'white' as const, promotedFromHoplite: true }],
      black: [{ id: 'c2', type: PieceTypes.DUCHESS, color: 'black' as const, promotedFromHoplite: true }]
    }

    expect(countHoplitePromotions(board, captured)).toBe(3)
  })

  it('allows promotion when under the global limit', () => {
    const board = createEmptyBoard()
    const piece = { id: 'h1', type: PieceTypes.HOPLITE, color: PlayerColors.WHITE as const, hasMoved: true }

    expect(canPromoteHoplite(piece, pos(0, 5), DEFAULT_SIZE, board, { white: [], black: [] })).toBe(true)
  })

  it('blocks promotion at the global limit regardless of player', () => {
    const board = createEmptyBoard()
    const piece = { id: 'h1', type: PieceTypes.HOPLITE, color: PlayerColors.WHITE as const, hasMoved: true }

    placePiece(board, pos(0, 0), { type: PieceTypes.DUCHESS, color: 'white', promotedFromHoplite: true })
    placePiece(board, pos(11, 0), { type: PieceTypes.DUCHESS, color: 'black', promotedFromHoplite: true })
    placePiece(board, pos(11, 1), { type: PieceTypes.DUCHESS, color: 'black', promotedFromHoplite: true })

    expect(canPromoteHoplite(piece, pos(0, 5), DEFAULT_SIZE, board, { white: [], black: [] })).toBe(false)
  })

  it('blocks promotion at the global limit when only one player promoted', () => {
    const board = createEmptyBoard()
    const piece = { id: 'h1', type: PieceTypes.HOPLITE, color: PlayerColors.WHITE as const, hasMoved: true }

    for (let col = 0; col < HOPLITE_PROMOTION_MAX; col++) {
      placePiece(board, pos(0, col), {
        type: PieceTypes.DUCHESS,
        color: 'white',
        promotedFromHoplite: true
      })
    }

    expect(canPromoteHoplite(piece, pos(0, 5), DEFAULT_SIZE, board, { white: [], black: [] })).toBe(false)
  })

  it('promoteHopliteToDuchess keeps identity and marks promotion', () => {
    const piece = {
      id: 'hoplite-99',
      type: PieceTypes.HOPLITE,
      color: PlayerColors.BLACK as const,
      hasMoved: true
    }

    const promoted = promoteHopliteToDuchess(piece)

    expect(promoted.id).toBe('hoplite-99')
    expect(promoted.type).toBe(PieceTypes.DUCHESS)
    expect(promoted.promotedFromHoplite).toBe(true)
    expect(promoted.hasMoved).toBe(true)
  })
})
