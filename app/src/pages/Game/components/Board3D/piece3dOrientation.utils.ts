import { FigureTiers, type FigureTierKey } from '../../../../constants/figures'
import { PieceTypes, PlayerColors, type PieceType, type PlayerColor } from '../../types'

const QUARTER_TURN = Math.PI / 2
const HALF_TURN = Math.PI
const FULL_TURN = Math.PI * 2

const normalizeFacingY = (rotationY: number): number => {
  let normalized = rotationY % FULL_TURN
  if (normalized <= -Math.PI) normalized += FULL_TURN
  if (normalized > Math.PI) normalized -= FULL_TURN
  return normalized
}

const getTier1BoardFacingY = (type: PieceType, color: PlayerColor): number => {
  const isWhite = color === PlayerColors.WHITE

  if (type === PieceTypes.CHARIOT) {
    return isWhite ? 0 : HALF_TURN
  }

  return isWhite ? QUARTER_TURN : -QUARTER_TURN
}

export const getPiece3DBoardFacingY = (
  type: PieceType,
  color: PlayerColor,
  tier: FigureTierKey,
): number => {
  const baseFacingY = getTier1BoardFacingY(type, color)
  const isWhite = color === PlayerColors.WHITE

  if (type === PieceTypes.PALADIN) {
    return normalizeFacingY(baseFacingY - QUARTER_TURN)
  }

  if (tier === FigureTiers.TIER1) {
    if (type === PieceTypes.CHARIOT) {
      return isWhite ? HALF_TURN : -QUARTER_TURN
    }

    if (type === PieceTypes.RAM_TOWER) {
      return HALF_TURN
    }

    if (type === PieceTypes.HOPLITE || type === PieceTypes.WARLOCK) {
      return isWhite ? QUARTER_TURN : -QUARTER_TURN
    }

    return baseFacingY
  }

  if (type === PieceTypes.CHARIOT) {
    return normalizeFacingY(baseFacingY + (isWhite ? QUARTER_TURN : HALF_TURN))
  }

  return baseFacingY
}

export const getPiece3DRulesPreviewFacingY = (type: PieceType): number =>
  type === PieceTypes.CHARIOT ? 0 : QUARTER_TURN
