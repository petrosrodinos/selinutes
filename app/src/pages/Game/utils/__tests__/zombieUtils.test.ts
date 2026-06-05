import { describe, it, expect } from 'vitest'
import {
  isZombieEligibleType,
  getAdjustedAttackRange,
  areRevivalGuardsInPlace,
  reviveZombiePiece,
  getZombieRevivePlacementTarget,
  getStartingPositionForPieceType,
  getNightModeFromBoard,
  getZombieReviveOpenState,
  getZombieReviveConfirmState,
  getZombieReviveStatusMessage
} from '../zombieUtils'
import { createInitialBoard } from '../boardUtils'
import { PieceTypes, isPiece } from '../../types'
import type { Piece } from '../../types'
import { createEmptyBoard, placePiece, pos, DEFAULT_SIZE } from './helpers/boardFixtures'

const makePiece = (overrides: Partial<Piece>): Piece => ({
  id: 'p',
  type: PieceTypes.RAM_TOWER,
  color: 'white',
  hasMoved: false,
  ...overrides
})

describe('isZombieEligibleType', () => {
  it.each([PieceTypes.RAM_TOWER, PieceTypes.CHARIOT, PieceTypes.BOMBER, PieceTypes.PALADIN])(
    'is eligible: %s',
    (type) => expect(isZombieEligibleType(type)).toBe(true)
  )

  it.each([PieceTypes.MONARCH, PieceTypes.HOPLITE, PieceTypes.NECROMANCER, PieceTypes.WARLOCK, PieceTypes.DUCHESS])(
    'is not eligible: %s',
    (type) => expect(isZombieEligibleType(type)).toBe(false)
  )
})

describe('getAdjustedAttackRange', () => {
  it('returns the base range for a normal piece', () => {
    expect(getAdjustedAttackRange(makePiece({ type: PieceTypes.RAM_TOWER }), 5)).toBe(5)
  })

  it('clamps a zombie non-bomber to 1', () => {
    expect(getAdjustedAttackRange(makePiece({ type: PieceTypes.RAM_TOWER, isZombie: true }), 5)).toBe(1)
  })

  it('forces a zombie bomber to 1', () => {
    expect(getAdjustedAttackRange(makePiece({ type: PieceTypes.BOMBER, isZombie: true }), 0)).toBe(1)
  })

  it('reduces necromancer range by 2 per revive', () => {
    expect(getAdjustedAttackRange(makePiece({ type: PieceTypes.NECROMANCER, reviveCount: 0 }), 8)).toBe(8)
    expect(getAdjustedAttackRange(makePiece({ type: PieceTypes.NECROMANCER, reviveCount: 2 }), 8)).toBe(4)
  })
})

describe('areRevivalGuardsInPlace', () => {
  it('is true when guards are home and unmoved', () => {
    const board = createInitialBoard(DEFAULT_SIZE)

    expect(areRevivalGuardsInPlace(board, DEFAULT_SIZE, 'white')).toBe(true)
  })

  it('is false when a guard has moved', () => {
    const board = createInitialBoard(DEFAULT_SIZE)
    const warlockPos = getStartingPositionForPieceType(DEFAULT_SIZE, PieceTypes.WARLOCK, 'white')!
    const warlock = board[warlockPos.row][warlockPos.col]
    if (warlock && isPiece(warlock)) warlock.hasMoved = true

    expect(areRevivalGuardsInPlace(board, DEFAULT_SIZE, 'white')).toBe(false)
  })

  it('is false when a guard is missing', () => {
    const board = createInitialBoard(DEFAULT_SIZE)
    const monarchPos = getStartingPositionForPieceType(DEFAULT_SIZE, PieceTypes.MONARCH, 'white')!
    board[monarchPos.row][monarchPos.col] = null

    expect(areRevivalGuardsInPlace(board, DEFAULT_SIZE, 'white')).toBe(false)
  })
})

describe('reviveZombiePiece', () => {
  it('increments revive count and places a zombie for the current player', () => {
    const board = createEmptyBoard()
    const necroPos = pos(9, 5)
    placePiece(board, necroPos, { type: PieceTypes.NECROMANCER, color: 'white', reviveCount: 0 })
    const revivePiece = makePiece({ type: PieceTypes.CHARIOT, color: 'black' })
    const target = pos(5, 5)

    const newBoard = reviveZombiePiece(board, necroPos, revivePiece, target, 'white')
    const necro = newBoard[9][5]
    const revived = newBoard[5][5]

    expect(isPiece(necro) && necro.reviveCount).toBe(1)
    expect(isPiece(revived) && revived.isZombie).toBe(true)
    expect(isPiece(revived) && revived.color).toBe('white')
    expect(isPiece(revived) && revived.hasMoved).toBe(false)
  })
})

describe('getZombieRevivePlacementTarget', () => {
  it('prefers the original starting square when empty', () => {
    const board = createEmptyBoard()
    const revivePiece = makePiece({ type: PieceTypes.RAM_TOWER })
    const expected = getStartingPositionForPieceType(DEFAULT_SIZE, PieceTypes.RAM_TOWER, 'white')

    expect(getZombieRevivePlacementTarget(board, DEFAULT_SIZE, revivePiece, 'white')).toEqual(expected)
  })

  it('falls back to the nearest empty square when the start is occupied', () => {
    const board = createEmptyBoard()
    const revivePiece = makePiece({ type: PieceTypes.RAM_TOWER })
    const start = getStartingPositionForPieceType(DEFAULT_SIZE, PieceTypes.RAM_TOWER, 'white')!
    placePiece(board, start, { type: PieceTypes.RAM_TOWER, color: 'white' })

    const target = getZombieRevivePlacementTarget(board, DEFAULT_SIZE, revivePiece, 'white')

    expect(target).not.toBeNull()
    expect(target).not.toEqual(start)
  })
})

describe('getNightModeFromBoard', () => {
  it('is true when any zombie is present', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(5, 5), { type: PieceTypes.RAM_TOWER, color: 'white', isZombie: true })

    expect(getNightModeFromBoard(board)).toBe(true)
  })

  it('is false when no zombies exist', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(5, 5), { type: PieceTypes.RAM_TOWER, color: 'white' })

    expect(getNightModeFromBoard(board)).toBe(false)
  })
})

describe('zombie revive UI guards', () => {
  const baseOpen = {
    gameOver: false,
    mysteryBoxActive: false,
    revivableCount: 1,
    necromancerPosition: pos(9, 5),
    isOnline: false,
    isMyTurn: true
  }

  it('open state requires a necromancer, revivable pieces and an idle board', () => {
    expect(getZombieReviveOpenState(baseOpen)).toBe(true)
    expect(getZombieReviveOpenState({ ...baseOpen, gameOver: true })).toBe(false)
    expect(getZombieReviveOpenState({ ...baseOpen, revivableCount: 0 })).toBe(false)
    expect(getZombieReviveOpenState({ ...baseOpen, necromancerPosition: null })).toBe(false)
    expect(getZombieReviveOpenState({ ...baseOpen, isOnline: true, isMyTurn: false })).toBe(false)
  })

  const baseConfirm = {
    necromancerPosition: pos(9, 5),
    selectedZombiePiece: makePiece({}),
    reviveTarget: pos(5, 5),
    guardsInPlace: true,
    isOnline: false,
    isMyTurn: true
  }

  it('confirm state requires a selection, target and guards', () => {
    expect(getZombieReviveConfirmState(baseConfirm)).toBe(true)
    expect(getZombieReviveConfirmState({ ...baseConfirm, guardsInPlace: false })).toBe(false)
    expect(getZombieReviveConfirmState({ ...baseConfirm, reviveTarget: null })).toBe(false)
    expect(getZombieReviveConfirmState({ ...baseConfirm, isOnline: true, isMyTurn: false })).toBe(false)
  })

  it('status message reports the first failing guard', () => {
    expect(
      getZombieReviveStatusMessage({
        isOnline: true,
        isMyTurn: false,
        necromancerPosition: pos(9, 5),
        guardsInPlace: true,
        revivableCount: 1,
        selectedZombiePiece: null,
        reviveTarget: null
      })
    ).toBe('Wait for your turn to revive a Zombie.')

    expect(
      getZombieReviveStatusMessage({
        isOnline: false,
        isMyTurn: true,
        necromancerPosition: pos(9, 5),
        guardsInPlace: true,
        revivableCount: 1,
        selectedZombiePiece: null,
        reviveTarget: null
      })
    ).toBeNull()
  })
})
