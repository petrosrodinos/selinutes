import type { PieceType } from '../../types'
import { ObstacleTypes, PieceTypes, PlayerColors } from '../../types'
import { getObstacle3DAssetUrl, getPiece3DAssetUrl } from '../../utils/figureAssets.utils'

const requireAssetUrl = (assetUrl: string | null, errorLabel: string): string => {
  if (assetUrl) return assetUrl
  throw new Error(`Missing figure asset: ${errorLabel}`)
}

export const pieceGLBMap: Record<PieceType, { white: string; black: string }> = {
  [PieceTypes.BOMBER]: {
    white: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.BOMBER, PlayerColors.WHITE), 'bomber variant_a 3d'),
    black: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.BOMBER, PlayerColors.BLACK), 'bomber variant_b 3d'),
  },
  [PieceTypes.CHARIOT]: {
    white: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.CHARIOT, PlayerColors.WHITE), 'chariot variant_a 3d'),
    black: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.CHARIOT, PlayerColors.BLACK), 'chariot variant_b 3d'),
  },
  [PieceTypes.DUCHESS]: {
    white: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.DUCHESS, PlayerColors.WHITE), 'duchess variant_a 3d'),
    black: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.DUCHESS, PlayerColors.BLACK), 'duchess variant_b 3d'),
  },
  [PieceTypes.HOPLITE]: {
    white: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.HOPLITE, PlayerColors.WHITE), 'hoplite variant_a 3d'),
    black: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.HOPLITE, PlayerColors.BLACK), 'hoplite variant_b 3d'),
  },
  [PieceTypes.MONARCH]: {
    white: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.MONARCH, PlayerColors.WHITE), 'monarch variant_a 3d'),
    black: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.MONARCH, PlayerColors.BLACK), 'monarch variant_b 3d'),
  },
  [PieceTypes.NECROMANCER]: {
    white: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.NECROMANCER, PlayerColors.WHITE), 'necromancer variant_a 3d'),
    black: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.NECROMANCER, PlayerColors.BLACK), 'necromancer variant_b 3d'),
  },
  [PieceTypes.PALADIN]: {
    white: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.PALADIN, PlayerColors.WHITE), 'paladin variant_a 3d'),
    black: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.PALADIN, PlayerColors.BLACK), 'paladin variant_b 3d'),
  },
  [PieceTypes.RAM_TOWER]: {
    white: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.RAM_TOWER, PlayerColors.WHITE), 'ram_tower variant_a 3d'),
    black: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.RAM_TOWER, PlayerColors.BLACK), 'ram_tower variant_b 3d'),
  },
  [PieceTypes.WARLOCK]: {
    white: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.WARLOCK, PlayerColors.WHITE), 'warlock variant_a 3d'),
    black: requireAssetUrl(getPiece3DAssetUrl(PieceTypes.WARLOCK, PlayerColors.BLACK), 'warlock variant_b 3d'),
  },
}

export const PIECE_GLB_URLS: readonly string[] = Object.values(pieceGLBMap).flatMap((pair) => [
  pair.white,
  pair.black,
])

const canyonGLB = requireAssetUrl(getObstacle3DAssetUrl(ObstacleTypes.CANYON), 'canyon variant_a 3d')
const caveGLB = requireAssetUrl(getObstacle3DAssetUrl(ObstacleTypes.CAVE), 'cave variant_a 3d')
const lakeGLB = requireAssetUrl(getObstacle3DAssetUrl(ObstacleTypes.LAKE), 'lake variant_a 3d')
const riverGLB = requireAssetUrl(getObstacle3DAssetUrl(ObstacleTypes.RIVER), 'river variant_a 3d')
const treeGLB = requireAssetUrl(getObstacle3DAssetUrl(ObstacleTypes.TREE), 'tree variant_a 3d')
const rockGLB = getObstacle3DAssetUrl(ObstacleTypes.ROCK)
const mysteryBoxGLB = getObstacle3DAssetUrl(ObstacleTypes.MYSTERY_BOX)

export { canyonGLB, caveGLB, lakeGLB, riverGLB, treeGLB, rockGLB, mysteryBoxGLB }

export const OBSTACLE_GLB_URLS: readonly string[] = [
  canyonGLB,
  caveGLB,
  lakeGLB,
  riverGLB,
  treeGLB,
  ...(rockGLB ? [rockGLB] : []),
  ...(mysteryBoxGLB ? [mysteryBoxGLB] : []),
]
