import { describe, expect, it } from 'vitest'
import { FigureTiers } from '../../../../../constants/figures'
import { PieceTypes, PlayerColors } from '../../../types'
import { getPiece3DBoardFacingY } from '../piece3dOrientation.utils'

describe('getPiece3DBoardFacingY', () => {
  it('keeps tier1 chariot and paladin on the default white/black yaw', () => {
    expect(getPiece3DBoardFacingY(PieceTypes.CHARIOT, PlayerColors.WHITE, FigureTiers.TIER1)).toBe(0)
    expect(getPiece3DBoardFacingY(PieceTypes.CHARIOT, PlayerColors.BLACK, FigureTiers.TIER1)).toBe(
      Math.PI,
    )
    expect(getPiece3DBoardFacingY(PieceTypes.PALADIN, PlayerColors.WHITE, FigureTiers.TIER1)).toBe(
      Math.PI / 2,
    )
    expect(getPiece3DBoardFacingY(PieceTypes.PALADIN, PlayerColors.BLACK, FigureTiers.TIER1)).toBe(
      -Math.PI / 2,
    )
  })

  it('applies skinned-tier yaw corrections for chariot and paladin', () => {
    for (const tier of [
      FigureTiers.TIER2,
      FigureTiers.TIER3,
      FigureTiers.TIER4,
      FigureTiers.TIER5,
    ]) {
      expect(getPiece3DBoardFacingY(PieceTypes.CHARIOT, PlayerColors.WHITE, tier)).toBe(Math.PI / 2)
      expect(getPiece3DBoardFacingY(PieceTypes.PALADIN, PlayerColors.WHITE, tier)).toBe(0)
      expect(getPiece3DBoardFacingY(PieceTypes.CHARIOT, PlayerColors.BLACK, tier)).toBe(0)
      expect(getPiece3DBoardFacingY(PieceTypes.PALADIN, PlayerColors.BLACK, tier)).toBe(Math.PI)
    }
  })
})
