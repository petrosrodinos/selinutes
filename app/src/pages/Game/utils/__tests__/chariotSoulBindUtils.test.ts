import { describe, it, expect } from 'vitest'
import {
  isChariotCaptureMove,
  bindCaptureToChariot,
  releaseCapturesBoundToChariot,
  isRevivableCapturedPiece,
  filterRevivableCapturedPieces,
  hasChariotBoundCaptures
} from '../chariotSoulBindUtils'
import { collectCapturedPiecesFromMoves } from '../moveUtils'
import { getZombieRevivePieces } from '../zombieUtils'
import { getRevivablePieces } from '../mysteryBoxUtils'
import { PieceTypes, PlayerColors } from '../../types'
import type { Move, Piece } from '../../types'

const chariotMove = (overrides: Partial<Move> = {}): Move => ({
  from: { row: 6, col: 5 },
  to: { row: 8, col: 6 },
  piece: { id: 'c1', type: PieceTypes.CHARIOT, color: PlayerColors.WHITE },
  captured: { id: 'v1', type: PieceTypes.PALADIN, color: PlayerColors.BLACK },
  isAttack: false,
  ...overrides
})

describe('chariotSoulBindUtils', () => {
  it('detects chariot capture-and-move', () => {
    expect(isChariotCaptureMove(chariotMove())).toBe(true)
    expect(isChariotCaptureMove(chariotMove({ isAttack: true }))).toBe(false)
    expect(isChariotCaptureMove(chariotMove({ captured: undefined }))).toBe(false)
    expect(isChariotCaptureMove(chariotMove({
      piece: { id: 'r1', type: PieceTypes.RAM_TOWER, color: PlayerColors.WHITE }
    }))).toBe(false)
  })

  it('binds a capture to a chariot id', () => {
    const captured = { id: 'v1', type: PieceTypes.BOMBER, color: PlayerColors.BLACK }
    expect(bindCaptureToChariot(captured, 'c1').chariotHeldBy).toBe('c1')
  })

  it('releases captures bound to a chariot', () => {
    const capturedPieces = {
      white: [],
      black: [
        { id: 'v1', type: PieceTypes.PALADIN, color: PlayerColors.BLACK, chariotHeldBy: 'c1' },
        { id: 'v2', type: PieceTypes.RAM_TOWER, color: PlayerColors.BLACK, chariotHeldBy: 'c2' }
      ] as Piece[]
    }

    const released = releaseCapturesBoundToChariot(capturedPieces, 'c1')

    expect(released.black[0].chariotHeldBy).toBeUndefined()
    expect(released.black[1].chariotHeldBy).toBe('c2')
  })

  it('filters revivable captured pieces', () => {
    const pieces = [
      { id: 'v1', type: PieceTypes.CHARIOT, color: PlayerColors.WHITE, chariotHeldBy: 'c1' },
      { id: 'v2', type: PieceTypes.BOMBER, color: PlayerColors.WHITE }
    ] as Piece[]

    expect(isRevivableCapturedPiece(pieces[1])).toBe(true)
    expect(filterRevivableCapturedPieces(pieces)).toHaveLength(1)
    expect(hasChariotBoundCaptures(pieces)).toBe(true)
  })
})

describe('collectCapturedPiecesFromMoves soul bind', () => {
  it('tags victims of chariot capture-and-move', () => {
    const moves = [chariotMove()]
    const result = collectCapturedPiecesFromMoves(moves, { white: [], black: [] })

    expect(result.black).toHaveLength(1)
    expect(result.black[0].chariotHeldBy).toBe('c1')
  })

  it('does not tag chariot ranged kills', () => {
    const moves = [chariotMove({ isAttack: true })]
    const result = collectCapturedPiecesFromMoves(moves, { white: [], black: [] })

    expect(result.black[0].chariotHeldBy).toBeUndefined()
  })

  it('does not tag ram tower move-captures', () => {
    const moves = [{
      from: { row: 6, col: 5 },
      to: { row: 6, col: 7 },
      piece: { id: 'r1', type: PieceTypes.RAM_TOWER, color: PlayerColors.WHITE },
      captured: { id: 'v1', type: PieceTypes.HOPLITE, color: PlayerColors.BLACK },
      isAttack: false
    }]
    const result = collectCapturedPiecesFromMoves(moves, { white: [], black: [] })

    expect(result.black[0].chariotHeldBy).toBeUndefined()
  })

  it('releases all victims when the binding chariot is captured', () => {
    const bindMove = chariotMove()
    const killChariotMove: Move = {
      from: { row: 4, col: 4 },
      to: { row: 8, col: 6 },
      piece: { id: 'd1', type: PieceTypes.DUCHESS, color: PlayerColors.BLACK },
      captured: { id: 'c1', type: PieceTypes.CHARIOT, color: PlayerColors.WHITE },
      isAttack: true
    }

    const afterBind = collectCapturedPiecesFromMoves([bindMove], { white: [], black: [] })
    const afterKill = collectCapturedPiecesFromMoves([killChariotMove], afterBind)

    expect(afterBind.black[0].chariotHeldBy).toBe('c1')
    expect(afterKill.white).toHaveLength(1)
    expect(afterKill.black[0].chariotHeldBy).toBeUndefined()
  })

  it('releases multiple victims bound to the same chariot', () => {
    const firstVictim = chariotMove({
      captured: { id: 'v1', type: PieceTypes.PALADIN, color: PlayerColors.BLACK }
    })
    const secondVictim = chariotMove({
      captured: { id: 'v2', type: PieceTypes.BOMBER, color: PlayerColors.BLACK }
    })
    const killChariotMove: Move = {
      from: { row: 4, col: 4 },
      to: { row: 8, col: 6 },
      piece: { id: 'd1', type: PieceTypes.DUCHESS, color: PlayerColors.BLACK },
      captured: { id: 'c1', type: PieceTypes.CHARIOT, color: PlayerColors.WHITE },
      isAttack: true
    }

    const afterCaptures = collectCapturedPiecesFromMoves([firstVictim, secondVictim], { white: [], black: [] })
    const afterKill = collectCapturedPiecesFromMoves([killChariotMove], afterCaptures)

    expect(afterCaptures.black.every(piece => piece.chariotHeldBy === 'c1')).toBe(true)
    expect(afterKill.black.every(piece => piece.chariotHeldBy === undefined)).toBe(true)
  })
})

describe('revive filters exclude chariot-bound captures', () => {
  const capturedPieces = {
    white: [
      { id: 'v1', type: PieceTypes.CHARIOT, color: PlayerColors.WHITE, chariotHeldBy: 'enemy-c1' },
      { id: 'v2', type: PieceTypes.BOMBER, color: PlayerColors.WHITE }
    ] as Piece[],
    black: []
  }

  it('excludes bound pieces from zombie revival', () => {
    const revivable = getZombieRevivePieces(capturedPieces, PlayerColors.WHITE)
    expect(revivable).toHaveLength(1)
    expect(revivable[0].id).toBe('v2')
  })

  it('excludes bound pieces from mystery box revival', () => {
    const revivable = getRevivablePieces(PlayerColors.WHITE, capturedPieces)
    expect(revivable).toHaveLength(1)
    expect(revivable[0].id).toBe('v2')
  })
})
