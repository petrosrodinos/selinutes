import { describe, expect, it } from 'vitest'
import { FigureTiers } from '../../../../../constants/figures'
import { PieceTypes, PlayerColors } from '../../../types'
import { getPiece3DBoardFacingY } from '../piece3dOrientation.utils'

describe('getPiece3DBoardFacingY', () => {
  it('faces tier1 chariot front for its yellow/green meshes', () => {
    expect(getPiece3DBoardFacingY(PieceTypes.CHARIOT, PlayerColors.WHITE, FigureTiers.TIER1)).toBe(
      Math.PI,
    )
    expect(getPiece3DBoardFacingY(PieceTypes.CHARIOT, PlayerColors.BLACK, FigureTiers.TIER1)).toBe(
      -Math.PI / 2,
    )
  })

  it('faces paladin front (not sideways) at every tier', () => {
    for (const tier of [
      FigureTiers.TIER1,
      FigureTiers.TIER2,
      FigureTiers.TIER3,
      FigureTiers.TIER4,
      FigureTiers.TIER5,
    ]) {
      expect(getPiece3DBoardFacingY(PieceTypes.PALADIN, PlayerColors.WHITE, tier)).toBe(0)
      expect(getPiece3DBoardFacingY(PieceTypes.PALADIN, PlayerColors.BLACK, tier)).toBe(Math.PI)
    }
  })

  it('applies skinned-tier yaw corrections for chariot', () => {
    for (const tier of [
      FigureTiers.TIER2,
      FigureTiers.TIER3,
      FigureTiers.TIER4,
      FigureTiers.TIER5,
    ]) {
      expect(getPiece3DBoardFacingY(PieceTypes.CHARIOT, PlayerColors.WHITE, tier)).toBe(Math.PI / 2)
      expect(getPiece3DBoardFacingY(PieceTypes.CHARIOT, PlayerColors.BLACK, tier)).toBe(0)
    }
  })

  it('faces tier1 ram-tower rotated 180 degrees from its original facing, for both colors', () => {
    expect(getPiece3DBoardFacingY(PieceTypes.RAM_TOWER, PlayerColors.WHITE, FigureTiers.TIER1)).toBe(Math.PI)
    expect(getPiece3DBoardFacingY(PieceTypes.RAM_TOWER, PlayerColors.BLACK, FigureTiers.TIER1)).toBe(0)
  })

  it('faces tier1 hoplite and warlock front (not sideways) for both colors', () => {
    for (const type of [PieceTypes.HOPLITE, PieceTypes.WARLOCK]) {
      expect(getPiece3DBoardFacingY(type, PlayerColors.WHITE, FigureTiers.TIER1)).toBe(Math.PI / 2)
      expect(getPiece3DBoardFacingY(type, PlayerColors.BLACK, FigureTiers.TIER1)).toBe(-Math.PI / 2)
    }
  })
})
