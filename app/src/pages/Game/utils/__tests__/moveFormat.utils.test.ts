import { describe, it, expect } from 'vitest'
import { formatMoveAction, formatMoveDescription } from '../moveFormat.utils'
import { MysteryBoxOptions, PieceTypes, PlayerColors } from '../../types'

const boardSize = { rows: 12, cols: 12 }

const baseMove = {
  from: { row: 8, col: 4 },
  to: { row: 6, col: 4 },
  piece: { id: '1', type: PieceTypes.HOPLITE, color: PlayerColors.WHITE, hasMoved: true },
}

describe('formatMoveAction', () => {
  it('labels mystery box activation with the rolled option', () => {
    const action = formatMoveAction({ ...baseMove, mysteryBoxOption: MysteryBoxOptions.FIGURE_SWAP })
    expect(action).toBe('Mystery Box · Figure Swap')
  })

  it('labels necromancer zombie revives', () => {
    const action = formatMoveAction({
      ...baseMove,
      piece: { id: '2', type: PieceTypes.NECROMANCER, color: PlayerColors.WHITE, hasMoved: true },
      isZombieRevive: true,
      revivedPiece: { id: '3', type: PieceTypes.CHARIOT, color: PlayerColors.WHITE, hasMoved: true },
    })
    expect(action).toBe('Revive · Chariot')
  })

  it('labels mystery box revives', () => {
    const action = formatMoveAction({
      ...baseMove,
      isMysteryBoxRevive: true,
      revivedPiece: { id: '4', type: PieceTypes.PALADIN, color: PlayerColors.BLACK, hasMoved: true },
    })
    expect(action).toBe('Mystery Box Revive · Paladin')
  })
})

describe('formatMoveDescription', () => {
  it('includes mystery box activation in the full description', () => {
    const description = formatMoveDescription(
      { ...baseMove, mysteryBoxOption: MysteryBoxOptions.OBSTACLE_SWAP },
      boardSize,
    )
    expect(description).toContain('Mystery Box · Obstacle Swap')
  })
})
