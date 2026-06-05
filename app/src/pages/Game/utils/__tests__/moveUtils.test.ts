import { describe, it, expect } from 'vitest'
import {
  makeMove,
  decrementFrozenTurnsForPlayer,
  hasLegalMoves,
  findMonarch,
  isMonarchCaptured
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

    const { newBoard, move } = makeMove(board, from, pos(4, 3), DEFAULT_SIZE)

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
