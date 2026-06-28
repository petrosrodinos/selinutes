import { figuresConfig, type FigureName } from '../../../constants/figures'
import { resolveFigureAssetUrl } from '../../../constants/figureAssetUrls'
import { ObstacleTypes, PieceTypes, PlayerColors, type ObstacleType, type PieceType, type PlayerColor } from '../types'

const PIECE_TO_FIGURE_NAME = {
  [PieceTypes.BOMBER]: 'bomber',
  [PieceTypes.CHARIOT]: 'chariot',
  [PieceTypes.DUCHESS]: 'duchess',
  [PieceTypes.HOPLITE]: 'hoplite',
  [PieceTypes.MONARCH]: 'monarch',
  [PieceTypes.NECROMANCER]: 'necromancer',
  [PieceTypes.PALADIN]: 'paladin',
  [PieceTypes.RAM_TOWER]: 'ram_tower',
  [PieceTypes.WARLOCK]: 'warlock',
} as const satisfies Record<PieceType, FigureName>

type PieceFigureName = typeof PIECE_TO_FIGURE_NAME[PieceType]

const OBSTACLE_TO_FIGURE_NAME: Partial<Record<ObstacleType, FigureName>> = {
  [ObstacleTypes.CANYON]: 'canyon',
  [ObstacleTypes.CAVE]: 'cave',
  [ObstacleTypes.LAKE]: 'lake',
  [ObstacleTypes.MYSTERY_BOX]: 'mystery_box',
  [ObstacleTypes.ROCK]: 'rock',
  [ObstacleTypes.RIVER]: 'river',
  [ObstacleTypes.TREE]: 'tree',
}

const getVariantKeyFromColor = (color: PlayerColor): 'variant_a' | 'variant_b' =>
  color === PlayerColors.WHITE ? 'variant_a' : 'variant_b'

export const getPiece2DAssetUrl = (pieceType: PieceType, color: PlayerColor): string | null => {
  const figureName: PieceFigureName = PIECE_TO_FIGURE_NAME[pieceType]
  const variantKey = getVariantKeyFromColor(color)
  const relativePath = figuresConfig[figureName].tier1.twoD[variantKey]
  if (!relativePath) return null
  return resolveFigureAssetUrl(relativePath)
}

export const getPiece3DAssetUrl = (pieceType: PieceType, color: PlayerColor): string | null => {
  const figureName: PieceFigureName = PIECE_TO_FIGURE_NAME[pieceType]
  const variantKey = getVariantKeyFromColor(color)
  const relativePath = figuresConfig[figureName].tier1.threeD[variantKey]
  if (!relativePath) return null
  return resolveFigureAssetUrl(relativePath)
}

export const getObstacle2DAssetUrl = (obstacleType: ObstacleType): string | null => {
  const figureName = OBSTACLE_TO_FIGURE_NAME[obstacleType]
  if (!figureName) return null
  const relativePath = figuresConfig[figureName].tier1.twoD.variant_a
  if (!relativePath) return null
  return resolveFigureAssetUrl(relativePath)
}

export const getObstacle3DAssetUrl = (obstacleType: ObstacleType): string | null => {
  const figureName = OBSTACLE_TO_FIGURE_NAME[obstacleType]
  if (!figureName) return null
  const relativePath = figuresConfig[figureName].tier1.threeD.variant_a
  if (!relativePath) return null
  return resolveFigureAssetUrl(relativePath)
}
