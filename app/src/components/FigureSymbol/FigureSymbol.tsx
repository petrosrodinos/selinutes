import type { PieceType } from '../../pages/Game/types'
import { PlayerColors, type PlayerColor } from '../../pages/Game/types'
import { PIECE_SYMBOLS } from '../../pages/Game/constants'
import { getPiece2DAssetUrl } from '../../pages/Game/utils/figureAssets.utils'

type FigureSymbolProps = {
  pieceType: PieceType
  color?: PlayerColor
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-5xl'
} as const

const imageSizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
} as const

export const FigureSymbol = ({ pieceType, color = PlayerColors.WHITE, size = 'md', className = '' }: FigureSymbolProps) => {
  const imageUrl = getPiece2DAssetUrl(pieceType, color)
  const symbol = PIECE_SYMBOLS[color][pieceType]

  return (
    <span
      className={`inline-flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
      aria-hidden
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className={`${imageSizeClasses[size]} object-contain`}
          draggable={false}
        />
      ) : (
        symbol
      )}
    </span>
  )
}
