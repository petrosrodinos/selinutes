import { describe, it, expect } from 'vitest'
import {
  makeMove,
  decrementFrozenTurnsForPlayer,
  hasLegalMoves,
  findMonarch,
  isMonarchCaptured,
  getValidMoves,
  getValidAttacks,
  getDisplayedAttackTargets,
  resolveAttackModeAction,
  canUseCaptureAttackMode
} from '../moveUtils'
import { PieceTypes, ObstacleTypes, isPiece } from '../../types'
import type { Narc } from '../../types'
import {
  createEmptyBoard,
  placePiece,
  placeObstacle,
  pos,
  DEFAULT_SIZE
} from './helpers/boardFixtures'

describe('makeMove', () => {
  it('does not mutate the source board', () => {
    const board = createEmptyBoard()
    const from = pos(6, 5)
    placePiece(board, from, { type: PieceTypes.RAM_TOWER, color: 'white' })

    makeMove(board, from, pos(4, 5), DEFAULT_SIZE)

    expect(isPiece(board[6][5])).toBe(true)
    expect(board[4][5]).toBeNull()
  })

  it('moves a piece and marks it as moved', () => {
    const board = createEmptyBoard()
    const from = pos(6, 5)
    placePiece(board, from, { type: PieceTypes.RAM_TOWER, color: 'white' })

    const { newBoard, move } = makeMove(board, from, pos(4, 5), DEFAULT_SIZE)
    const moved = newBoard[4][5]

    expect(newBoard[6][5]).toBeNull()
    expect(isPiece(moved) && moved.hasMoved).toBe(true)
    expect(move.from).toEqual(from)
    expect(move.to).toEqual(pos(4, 5))
  })

  it('ranged attack removes the target but keeps the attacker in place', () => {
    const board = createEmptyBoard()
    const from = pos(6, 5)
    const target = pos(6, 8)
    placePiece(board, from, { type: PieceTypes.RAM_TOWER, color: 'white' })
    placePiece(board, target, { type: PieceTypes.HOPLITE, color: 'black' })

    const { newBoard, move } = makeMove(board, from, target, DEFAULT_SIZE, true)

    expect(isPiece(newBoard[6][5])).toBe(true)
    expect(newBoard[6][8]).toBeNull()
    expect(move.isAttack).toBe(true)
    expect(move.captured?.type).toBe(PieceTypes.HOPLITE)
  })

  it('restores the obstacle a piece was standing on when it leaves', () => {
    const board = createEmptyBoard()
    const from = pos(6, 5)
    placePiece(board, from, {
      type: PieceTypes.HOPLITE,
      color: 'white',
      hasMoved: true,
      standingOnObstacle: ObstacleTypes.MYSTERY_BOX
    })

    const { newBoard } = makeMove(board, from, pos(5, 5), DEFAULT_SIZE)
    const restored = newBoard[6][5]

    expect(restored && !isPiece(restored) && restored.type).toBe(ObstacleTypes.MYSTERY_BOX)
  })

  it('teleports a hoplite that enters a cave to a cell adjacent to another cave', () => {
    const board = createEmptyBoard()
    const from = pos(6, 5)
    placePiece(board, from, { type: PieceTypes.HOPLITE, color: 'white' })
    placeObstacle(board, pos(5, 5), ObstacleTypes.CAVE)
    placeObstacle(board, pos(5, 8), ObstacleTypes.CAVE)

    const { move } = makeMove(board, from, pos(5, 5), DEFAULT_SIZE)

    const chebyshev = Math.max(Math.abs(move.to.row - 5), Math.abs(move.to.col - 8))
    expect(chebyshev).toBe(1)
  })

  it('destroys a piece that walks into an enemy narc net', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(4, 5), { type: PieceTypes.BOMBER, color: 'black', hasMoved: true })
    const from = pos(5, 3)
    placePiece(board, from, { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true })

    const { newBoard, moves, move } = makeMove(board, from, pos(4, 3), DEFAULT_SIZE)

    expect(moves).toHaveLength(1)
    expect(move.terminatedByNarc).toBe(true)
    expect(newBoard[5][3]).toBeNull()
    expect(newBoard[4][3]).toBeNull()
  })

  it('logs capture and narc trap when move-capturing an enemy on a narc net tile', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(4, 5), { type: PieceTypes.BOMBER, color: 'black', hasMoved: true })
    const from = pos(5, 3)
    const target = pos(4, 3)
    placePiece(board, from, { type: PieceTypes.PALADIN, color: 'white', hasMoved: true })
    placePiece(board, target, { type: PieceTypes.HOPLITE, color: 'black', hasMoved: true })

    const { newBoard, moves } = makeMove(board, from, target, DEFAULT_SIZE)

    expect(moves).toHaveLength(2)
    expect(moves[0].captured?.type).toBe(PieceTypes.HOPLITE)
    expect(moves[0].terminatedByNarc).toBeUndefined()
    expect(moves[1].terminatedByNarc).toBe(true)
    expect(moves[1].captured?.id).toBe(moves[1].piece.id)
    expect(newBoard[5][3]).toBeNull()
    expect(newBoard[4][3]).toBeNull()
  })

  it('logs capture and narc trap through capture attack mode for Ram Tower on a narc tile', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(4, 5), { type: PieceTypes.BOMBER, color: 'black', hasMoved: true })
    const from = pos(6, 3)
    const target = pos(4, 3)
    const ram = placePiece(board, from, { type: PieceTypes.RAM_TOWER, color: 'white', hasMoved: true })
    const targetCell = placePiece(board, target, { type: PieceTypes.HOPLITE, color: 'black', hasMoved: true })

    const action = resolveAttackModeAction(
      ram,
      targetCell,
      true,
      true,
      'capture',
      { board, from, to: target, boardSize: DEFAULT_SIZE }
    )

    expect(action.shouldUseMoveCapture).toBe(true)
    expect(action.shouldUseRangedAttack).toBe(false)

    const isAttack = action.shouldUseRangedAttack && !action.shouldUseMoveCapture
    const { newBoard, moves } = makeMove(board, from, target, DEFAULT_SIZE, isAttack)

    expect(moves).toHaveLength(2)
    expect(moves[0].captured?.type).toBe(PieceTypes.HOPLITE)
    expect(moves[1].terminatedByNarc).toBe(true)
    expect(newBoard[6][3]).toBeNull()
    expect(newBoard[4][3]).toBeNull()
  })

  it('does not trigger narc when using ranged attack on an enemy sitting on a narc tile', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(4, 5), { type: PieceTypes.BOMBER, color: 'black', hasMoved: true })
    const from = pos(5, 3)
    const target = pos(4, 3)
    const paladin = placePiece(board, from, { type: PieceTypes.PALADIN, color: 'white', hasMoved: true })
    const targetCell = placePiece(board, target, { type: PieceTypes.HOPLITE, color: 'black', hasMoved: true })

    const action = resolveAttackModeAction(
      paladin,
      targetCell,
      true,
      true,
      'ranged',
      { board, from, to: target, boardSize: DEFAULT_SIZE }
    )

    expect(action.shouldUseRangedAttack).toBe(true)
    expect(action.shouldUseMoveCapture).toBe(false)

    const isAttack = action.shouldUseRangedAttack && !action.shouldUseMoveCapture
    const { newBoard, moves } = makeMove(board, from, target, DEFAULT_SIZE, isAttack)

    expect(moves).toHaveLength(1)
    expect(moves[0].terminatedByNarc).toBeUndefined()
    expect(moves[0].captured?.type).toBe(PieceTypes.HOPLITE)
    expect(newBoard[5][3]?.type).toBe(PieceTypes.PALADIN)
    expect(newBoard[4][3]).toBeNull()
  })

  it('triggers narc from stored narcs array on an empty net tile', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(6, 5), { type: PieceTypes.BOMBER, color: 'black', hasMoved: true })
    const from = pos(5, 3)
    placePiece(board, from, { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true })
    const narcs: Narc[] = [
      { id: 'n1', position: pos(4, 3), ownerColor: 'black', bomberId: 'b1' }
    ]

    const { newBoard, move } = makeMove(board, from, pos(4, 3), DEFAULT_SIZE, false, narcs)

    expect(move.terminatedByNarc).toBe(true)
    expect(newBoard[5][3]).toBeNull()
    expect(newBoard[4][3]).toBeNull()
  })

  it('creates narcs around a bomber when it moves', () => {
    const board = createEmptyBoard()
    const from = pos(6, 5)
    const bomber = placePiece(board, from, { type: PieceTypes.BOMBER, color: 'white' })

    const { newNarcs } = makeMove(board, from, pos(6, 6), DEFAULT_SIZE)

    expect(newNarcs).toHaveLength(12)
    expect(newNarcs.every(n => n.bomberId === bomber.id)).toBe(true)
  })

  it('removes a captured bombers narcs', () => {
    const board = createEmptyBoard()
    const from = pos(6, 5)
    const target = pos(6, 8)
    placePiece(board, from, { type: PieceTypes.RAM_TOWER, color: 'white' })
    placePiece(board, target, { type: PieceTypes.BOMBER, color: 'black', id: 'b1' })
    const narcs: Narc[] = [
      { id: 'n1', position: pos(1, 1), ownerColor: 'black', bomberId: 'b1' },
      { id: 'n2', position: pos(2, 2), ownerColor: 'black', bomberId: 'b2' }
    ]

    const { newNarcs } = makeMove(board, from, target, DEFAULT_SIZE, true, narcs)

    expect(newNarcs.map(n => n.bomberId)).toEqual(['b2'])
  })
})

describe('decrementFrozenTurnsForPlayer', () => {
  it('ticks down only the given players frozen counters', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(2, 2), { type: PieceTypes.HOPLITE, color: 'white', frozenTurns: 2 })
    placePiece(board, pos(3, 3), { type: PieceTypes.HOPLITE, color: 'white', frozenTurns: 1 })
    placePiece(board, pos(4, 4), { type: PieceTypes.HOPLITE, color: 'black', frozenTurns: 2 })

    const updated = decrementFrozenTurnsForPlayer(board, 'white')
    const a = updated[2][2]
    const b = updated[3][3]
    const c = updated[4][4]

    expect(isPiece(a) && a.frozenTurns).toBe(1)
    expect(isPiece(b) && (b.frozenTurns ?? 0)).toBe(0)
    expect(isPiece(c) && c.frozenTurns).toBe(2)
  })
})

describe('monarch detection', () => {
  it('finds a monarch and reports capture of a missing one', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(11, 5), { type: PieceTypes.MONARCH, color: 'white' })

    expect(findMonarch(board, 'white')).toEqual(pos(11, 5))
    expect(isMonarchCaptured(board, 'white')).toBe(false)
    expect(findMonarch(board, 'black')).toBeNull()
    expect(isMonarchCaptured(board, 'black')).toBe(true)
  })
})

describe('frozen capture attack mode', () => {
  it('canUseCaptureAttackMode is false for frozen figures with dual attack modes', () => {
    const frozenRam = { id: 'ram1', type: PieceTypes.RAM_TOWER, color: 'white' as const, frozenTurns: 1 }
    const activeRam = { id: 'ram2', type: PieceTypes.RAM_TOWER, color: 'white' as const }

    expect(canUseCaptureAttackMode(frozenRam)).toBe(false)
    expect(canUseCaptureAttackMode(activeRam)).toBe(true)
  })

  it('getDisplayedAttackTargets ignores capture mode for frozen ram tower', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const rangedTarget = pos(6, 8)
    const captureTarget = pos(4, 5)
    const ram = { id: 'ram1', type: PieceTypes.RAM_TOWER, color: 'white' as const, frozenTurns: 1 }
    placePiece(board, start, ram)
    placePiece(board, rangedTarget, { type: PieceTypes.HOPLITE, color: 'black' })
    placePiece(board, captureTarget, { type: PieceTypes.HOPLITE, color: 'black' })

    const moves = getValidMoves(board, start, DEFAULT_SIZE)
    const attacks = getValidAttacks(board, start, DEFAULT_SIZE)
    const displayed = getDisplayedAttackTargets(
      board,
      moves,
      attacks,
      ram,
      start,
      'capture',
      DEFAULT_SIZE
    )

    expect(displayed).toEqual(attacks)
    expect(displayed).toContainEqual(rangedTarget)
  })

  it('resolveAttackModeAction rejects move capture for frozen figures', () => {
    const board = createEmptyBoard()
    const from = pos(6, 5)
    const to = pos(4, 5)
    const ram = { id: 'ram1', type: PieceTypes.RAM_TOWER, color: 'white' as const, frozenTurns: 1 }
    placePiece(board, from, ram)
    placePiece(board, to, { type: PieceTypes.HOPLITE, color: 'black' })

    const result = resolveAttackModeAction(
      ram,
      board[to.row][to.col]!,
      true,
      false,
      'capture',
      { board, from, to, boardSize: DEFAULT_SIZE }
    )

    expect(result.shouldUseMoveCapture).toBe(false)
    expect(result.shouldUseRangedAttack).toBe(false)
  })

  it('getDisplayedAttackTargets ignores capture mode for frozen chariot', () => {
    const board = createEmptyBoard()
    const start = pos(6, 5)
    const rangedTarget = pos(9, 6)
    const chariot = { id: 'c1', type: PieceTypes.CHARIOT, color: 'white' as const, frozenTurns: 1 }
    placePiece(board, start, chariot)
    placePiece(board, rangedTarget, { type: PieceTypes.HOPLITE, color: 'black' })

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

    expect(displayed).toEqual(attacks)
    expect(displayed).toContainEqual(rangedTarget)
  })

  it('resolveAttackModeAction uses ranged attack for frozen chariot in capture mode', () => {
    const board = createEmptyBoard()
    const from = pos(6, 5)
    const to = pos(9, 6)
    const chariot = { id: 'c1', type: PieceTypes.CHARIOT, color: 'white' as const, frozenTurns: 1 }
    placePiece(board, from, chariot)
    placePiece(board, to, { type: PieceTypes.HOPLITE, color: 'black' })

    const result = resolveAttackModeAction(
      chariot,
      board[to.row][to.col]!,
      false,
      true,
      'capture',
      { board, from, to, boardSize: DEFAULT_SIZE }
    )

    expect(result.shouldUseMoveCapture).toBe(false)
    expect(result.shouldUseRangedAttack).toBe(true)
  })

  it('resolveAttackModeAction uses ranged attack for frozen ram tower in capture mode', () => {
    const board = createEmptyBoard()
    const from = pos(6, 5)
    const to = pos(6, 8)
    const ram = { id: 'ram1', type: PieceTypes.RAM_TOWER, color: 'white' as const, frozenTurns: 1 }
    placePiece(board, from, ram)
    placePiece(board, to, { type: PieceTypes.HOPLITE, color: 'black' })

    const result = resolveAttackModeAction(
      ram,
      board[to.row][to.col]!,
      false,
      true,
      'capture',
      { board, from, to, boardSize: DEFAULT_SIZE }
    )

    expect(result.shouldUseMoveCapture).toBe(false)
    expect(result.shouldUseRangedAttack).toBe(true)
  })
})

describe('hasLegalMoves', () => {
  it('returns true when a piece can move', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(6, 5), { type: PieceTypes.HOPLITE, color: 'white' })

    expect(hasLegalMoves(board, 'white', DEFAULT_SIZE)).toBe(true)
  })

  it('returns false when the only piece is stuck', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(0, 5), { type: PieceTypes.HOPLITE, color: 'white', hasMoved: true })

    expect(hasLegalMoves(board, 'white', DEFAULT_SIZE)).toBe(false)
  })

  it('returns true when only a necromancer freeze is available', () => {
    const board = createEmptyBoard()
    const necro = pos(9, 5)
    placePiece(board, necro, { type: PieceTypes.NECROMANCER, color: 'white' })
    for (const cell of [
      pos(8, 4), pos(8, 5), pos(8, 6),
      pos(9, 4), pos(9, 6),
      pos(10, 4), pos(10, 5), pos(10, 6)
    ]) {
      placeObstacle(board, cell, ObstacleTypes.RIVER)
    }
    placePiece(board, pos(1, 5), { type: PieceTypes.HOPLITE, color: 'black' })

    expect(hasLegalMoves(board, 'white', DEFAULT_SIZE)).toBe(true)
  })
})
