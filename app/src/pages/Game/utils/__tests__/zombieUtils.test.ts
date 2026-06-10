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
  getZombieReviveStatusMessage,
  getZombieRevivePieces,
  ZOMBIE_REVIVE_ALIGNMENT_HINT
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

describe('getZombieRevivePieces', () => {
  it('excludes chariot-bound zombie-eligible captures', () => {
    const capturedPieces = {
      white: [
        makePiece({ id: 'bound', type: PieceTypes.CHARIOT, chariotHeldBy: 'enemy-c1' }),
        makePiece({ id: 'free', type: PieceTypes.BOMBER })
      ],
      black: []
    }

    expect(getZombieRevivePieces(capturedPieces, 'white')).toEqual([
      expect.objectContaining({ id: 'free' })
    ])
  })
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
  it('is true when necromancer, monarch, duchess, and warlock share a row', () => {
    const board = createInitialBoard(DEFAULT_SIZE)

    expect(areRevivalGuardsInPlace(board, DEFAULT_SIZE, 'white')).toBe(true)
  })

  it('is true when all four are on the same row away from their starts', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(6, 2), { type: PieceTypes.NECROMANCER, color: 'white' })
    placePiece(board, pos(6, 4), { type: PieceTypes.WARLOCK, color: 'white' })
    placePiece(board, pos(6, 5), { type: PieceTypes.MONARCH, color: 'white' })
    placePiece(board, pos(6, 8), { type: PieceTypes.DUCHESS, color: 'white' })

    expect(areRevivalGuardsInPlace(board, DEFAULT_SIZE, 'white')).toBe(true)
  })

  it('is false when the four are not on the same row', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(6, 2), { type: PieceTypes.NECROMANCER, color: 'white' })
    placePiece(board, pos(6, 4), { type: PieceTypes.WARLOCK, color: 'white' })
    placePiece(board, pos(6, 5), { type: PieceTypes.MONARCH, color: 'white' })
    placePiece(board, pos(7, 8), { type: PieceTypes.DUCHESS, color: 'white' })

    expect(areRevivalGuardsInPlace(board, DEFAULT_SIZE, 'white')).toBe(false)
  })

  it('is false when the warlock leaves the shared row', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(6, 2), { type: PieceTypes.NECROMANCER, color: 'white' })
    placePiece(board, pos(7, 4), { type: PieceTypes.WARLOCK, color: 'white' })
    placePiece(board, pos(6, 5), { type: PieceTypes.MONARCH, color: 'white' })
    placePiece(board, pos(6, 8), { type: PieceTypes.DUCHESS, color: 'white' })

    expect(areRevivalGuardsInPlace(board, DEFAULT_SIZE, 'white')).toBe(false)
  })

  it('is false after the necromancer leaves the shared row', () => {
    const board = createInitialBoard(DEFAULT_SIZE)
    const necroPos = getStartingPositionForPieceType(DEFAULT_SIZE, PieceTypes.NECROMANCER, 'white')!
    const necro = board[necroPos.row][necroPos.col]
    board[necroPos.row][necroPos.col] = null
    if (necro && isPiece(necro)) {
      placePiece(board, { row: necroPos.row - 1, col: necroPos.col }, necro)
    }

    expect(areRevivalGuardsInPlace(board, DEFAULT_SIZE, 'white')).toBe(false)
  })

  it('is false when a required piece is missing', () => {
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
    const revivePiece = makePiece({ type: PieceTypes.RAM_TOWER, startCol: 0 })
    const expected = getStartingPositionForPieceType(DEFAULT_SIZE, PieceTypes.RAM_TOWER, 'white', 0)

    expect(getZombieRevivePlacementTarget(board, DEFAULT_SIZE, revivePiece, 'white')).toEqual(expected)
  })

  it('uses the captured piece start column for duplicate back-row types', () => {
    const board = createInitialBoard(DEFAULT_SIZE)
    const whiteBackRow = DEFAULT_SIZE.rows - 1
    const secondRamCol = DEFAULT_SIZE.cols - 1
    const capturedRam = board[whiteBackRow][secondRamCol]
    expect(capturedRam && isPiece(capturedRam)).toBe(true)

    board[whiteBackRow][secondRamCol] = null
    placePiece(board, { row: whiteBackRow, col: 0 }, { type: PieceTypes.RAM_TOWER, color: 'white', startCol: 0 })

    const target = getZombieRevivePlacementTarget(
      board,
      DEFAULT_SIZE,
      capturedRam as Piece,
      'white'
    )

    expect(target).toEqual({ row: whiteBackRow, col: secondRamCol })
  })

  it('falls back to the nearest empty square when the original square is occupied', () => {
    const board = createEmptyBoard()
    const revivePiece = makePiece({ type: PieceTypes.RAM_TOWER, startCol: 0 })
    const start = getStartingPositionForPieceType(DEFAULT_SIZE, PieceTypes.RAM_TOWER, 'white', 0)!
    placePiece(board, start, { type: PieceTypes.RAM_TOWER, color: 'white', startCol: 0 })

    const target = getZombieRevivePlacementTarget(board, DEFAULT_SIZE, revivePiece, 'white')

    expect(target).not.toBeNull()
    expect(target).not.toEqual(start)
    expect(Math.abs(target!.row - start.row) + Math.abs(target!.col - start.col)).toBe(1)
  })

  it('falls back to the nearest empty square to the original column', () => {
    const board = createEmptyBoard()
    const whiteBackRow = DEFAULT_SIZE.rows - 1
    const revivePiece = makePiece({ type: PieceTypes.CHARIOT, startCol: 10 })
    const original = { row: whiteBackRow, col: 10 }

    placePiece(board, original, { type: PieceTypes.MONARCH, color: 'white' })
    placePiece(board, { row: whiteBackRow, col: 9 }, { type: PieceTypes.HOPLITE, color: 'white' })
    placePiece(board, { row: whiteBackRow - 1, col: 10 }, { type: PieceTypes.HOPLITE, color: 'white' })

    const target = getZombieRevivePlacementTarget(board, DEFAULT_SIZE, revivePiece, 'white')

    expect(target).toEqual({ row: whiteBackRow, col: 11 })
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
    board: createInitialBoard(DEFAULT_SIZE),
    boardSize: DEFAULT_SIZE,
    revivePlayerColor: 'white' as const,
    necromancerPosition: pos(9, 5),
    selectedZombiePiece: makePiece({}),
    reviveTarget: pos(5, 5),
    isOnline: false,
    isMyTurn: true
  }

  it('confirm state requires a selection, target and guards', () => {
    expect(getZombieReviveConfirmState(baseConfirm)).toBe(true)
    expect(getZombieReviveConfirmState({
      ...baseConfirm,
      board: (() => {
        const board = createInitialBoard(DEFAULT_SIZE)
        const necroPos = getStartingPositionForPieceType(DEFAULT_SIZE, PieceTypes.NECROMANCER, 'white')!
        const necro = board[necroPos.row][necroPos.col]
        board[necroPos.row][necroPos.col] = null
        if (necro && isPiece(necro)) {
          placePiece(board, { row: necroPos.row - 1, col: necroPos.col }, necro)
        }
        return board
      })()
    })).toBe(false)
    expect(getZombieReviveConfirmState({ ...baseConfirm, reviveTarget: null })).toBe(false)
    expect(getZombieReviveConfirmState({ ...baseConfirm, isOnline: true, isMyTurn: false })).toBe(false)
  })

  it('status message reports the first failing guard', () => {
    expect(
      getZombieReviveStatusMessage({
        isOnline: true,
        isMyTurn: false,
        necromancerPosition: pos(9, 5),
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
        revivableCount: 1,
        selectedZombiePiece: null,
        reviveTarget: null
      })
    ).toBeNull()

    expect(
      getZombieReviveStatusMessage({
        isOnline: false,
        isMyTurn: true,
        necromancerPosition: pos(9, 5),
        revivableCount: 0,
        selectedZombiePiece: null,
        reviveTarget: null
      })
    ).toBe('No eligible captured pieces available.')

    expect(
      getZombieReviveStatusMessage({
        isOnline: false,
        isMyTurn: true,
        necromancerPosition: pos(9, 5),
        revivableCount: 0,
        hasChariotBoundCaptures: true,
        selectedZombiePiece: null,
        reviveTarget: null
      })
    ).toBe('Captured pieces taken by an enemy Chariot capture-and-move cannot be revived until that Chariot is destroyed.')

    expect(ZOMBIE_REVIVE_ALIGNMENT_HINT).toBe(
      'Necromancer, Monarch, Duchess, and Warlock must be on the same horizontal line.'
    )
  })
})
