import { describe, expect, it } from 'vitest'
import { FigureTiers } from '../../../../../constants/figures'
import { PieceTypes, PlayerColors } from '../../../types'
import { getPiece3DBoardFacingY } from '../piece3dOrientation.utils'

describe('getPiece3DBoardFacingY', () => {
  it('keeps tier1 chariot on the default white/black yaw', () => {
    expect(getPiece3DBoardFacingY(PieceTypes.CHARIOT, PlayerColors.WHITE, FigureTiers.TIER1)).toBe(0)
    expect(getPiece3DBoardFacingY(PieceTypes.CHARIOT, PlayerColors.BLACK, FigureTiers.TIER1)).toBe(
      Math.PI,
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
})
