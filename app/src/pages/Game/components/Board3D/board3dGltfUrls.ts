import type { FigureTierKey } from '../../../../constants/figures'
import { FigureTiers } from '../../../../constants/figures'
import type { PieceType } from '../../types'
import { ObstacleTypes, PieceTypes, PlayerColors, type PlayerColor } from '../../types'
import { getObstacle3DAssetUrl, getPiece3DAssetUrl } from '../../utils/figureAssets.utils'

const requireAssetUrl = (assetUrl: string | null, errorLabel: string): string => {
  if (assetUrl) return assetUrl
  throw new Error(`Missing figure asset: ${errorLabel}`)
}

export const getPieceGlbUrl = (
  type: PieceType,
  color: PlayerColor,
  tier: FigureTierKey = FigureTiers.TIER1,
): string => {
  const variantLabel = color === PlayerColors.WHITE ? 'variant_a' : 'variant_b'
  return requireAssetUrl(
    getPiece3DAssetUrl(type, color, tier),
    `${type} ${variantLabel} 3d tier ${tier}`,
  )
}

export const collectPieceGlbUrlsForTier = (tier: FigureTierKey): string[] => {
  const pieceTypes = Object.values(PieceTypes)
  return pieceTypes.flatMap((type) => [
    getPieceGlbUrl(type, PlayerColors.WHITE, tier),
    getPieceGlbUrl(type, PlayerColors.BLACK, tier),
  ])
}

export const collectPieceGlbUrlsForTiers = (whiteTier: FigureTierKey, blackTier: FigureTierKey): string[] => {
  const tiers = whiteTier === blackTier ? [whiteTier] : [whiteTier, blackTier]
  return tiers.flatMap((tier) => collectPieceGlbUrlsForTier(tier))
}

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

export const PIECE_GLB_URLS: readonly string[] = collectPieceGlbUrlsForTier(FigureTiers.TIER1)
