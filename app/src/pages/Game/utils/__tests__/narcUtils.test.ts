import { describe, it, expect } from 'vitest'
import {
  getNarcPositions,
  createNarcsForBomber,
  removeNarcsForBomber,
  checkNarcTrigger,
  getAllNarcNetPositions
} from '../narcUtils'
import { PieceTypes } from '../../types'
import type { Narc } from '../../types'
import { createEmptyBoard, placePiece, pos, DEFAULT_SIZE } from './helpers/boardFixtures'

describe('getNarcPositions', () => {
  it('returns the 12 fixed narc offsets', () => {
    const positions = getNarcPositions(pos(6, 5))

    expect(positions).toHaveLength(12)
    expect(positions).toContainEqual(pos(5, 4))
    expect(positions).toContainEqual(pos(4, 3))
    expect(positions).toContainEqual(pos(4, 5))
    expect(positions).toContainEqual(pos(6, 3))
  })
})

describe('createNarcsForBomber', () => {
  it('creates narcs only on in-bounds empty cells', () => {
    const board = createEmptyBoard()

    const narcs = createNarcsForBomber(pos(0, 0), 'white', 'b1', board, DEFAULT_SIZE, [])

    expect(narcs).toHaveLength(4)
  })

  it('does not duplicate an existing narc position', () => {
    const board = createEmptyBoard()
    const existing: Narc[] = [{ id: 'n0', position: pos(5, 4), ownerColor: 'white', bomberId: 'b0' }]

    const narcs = createNarcsForBomber(pos(6, 5), 'white', 'b1', board, DEFAULT_SIZE, existing)

    expect(narcs).toHaveLength(11)
    expect(narcs.some(n => n.position.row === 5 && n.position.col === 4)).toBe(false)
  })

  it('skips cells occupied by a piece', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(4, 5), { type: PieceTypes.HOPLITE, color: 'black' })

    const narcs = createNarcsForBomber(pos(6, 5), 'white', 'b1', board, DEFAULT_SIZE, [])

    expect(narcs.some(n => n.position.row === 4 && n.position.col === 5)).toBe(false)
  })
})

describe('removeNarcsForBomber', () => {
  it('removes only the matching bombers narcs', () => {
    const narcs: Narc[] = [
      { id: 'n1', position: pos(1, 1), ownerColor: 'white', bomberId: 'b1' },
      { id: 'n2', position: pos(2, 2), ownerColor: 'white', bomberId: 'b2' }
    ]

    expect(removeNarcsForBomber(narcs, 'b1').map(n => n.id)).toEqual(['n2'])
  })
})

describe('checkNarcTrigger', () => {
  const narcs: Narc[] = [{ id: 'n1', position: pos(3, 3), ownerColor: 'white', bomberId: 'b1' }]

  it('triggers for an enemy piece', () => {
    expect(checkNarcTrigger(narcs, pos(3, 3), 'black')).toBeDefined()
  })

  it('does not trigger for the owner', () => {
    expect(checkNarcTrigger(narcs, pos(3, 3), 'white')).toBeUndefined()
  })

  it('does not trigger off a narc cell', () => {
    expect(checkNarcTrigger(narcs, pos(0, 0), 'black')).toBeUndefined()
  })
})

describe('getAllNarcNetPositions', () => {
  it('forms a net only for a moved non-zombie bomber', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(6, 5), { type: PieceTypes.BOMBER, color: 'white', hasMoved: true })

    expect(getAllNarcNetPositions(board, DEFAULT_SIZE)).toHaveLength(12)
  })

  it('does not form a net for an unmoved bomber', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(6, 5), { type: PieceTypes.BOMBER, color: 'white', hasMoved: false })

    expect(getAllNarcNetPositions(board, DEFAULT_SIZE)).toHaveLength(0)
  })

  it('does not form a net for a zombie bomber', () => {
    const board = createEmptyBoard()
    placePiece(board, pos(6, 5), { type: PieceTypes.BOMBER, color: 'white', hasMoved: true, isZombie: true })

    expect(getAllNarcNetPositions(board, DEFAULT_SIZE)).toHaveLength(0)
  })
})
