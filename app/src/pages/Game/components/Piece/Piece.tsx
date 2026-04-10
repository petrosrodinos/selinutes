import type { Piece as PieceType } from '../../types'
import { PlayerColors } from '../../types'
import { PIECE_SYMBOLS, PIECE_NAMES } from '../../constants'
import { getPiece2DAssetUrl } from '../../utils/figureAssets.utils'

interface PieceProps {
  piece: PieceType
}

export const Piece = ({ piece }: PieceProps) => {
  const pieceName = PIECE_NAMES[piece.type]
  const displayName = piece.isZombie ? `${pieceName} (Zombie)` : pieceName
  const imageUrl = getPiece2DAssetUrl(piece.type, piece.color)

  return (
    <span
      className={`text-2xl md:text-3xl select-none drop-shadow-lg transition-transform duration-150 hover:scale-110 ${
        piece.color === PlayerColors.WHITE ? '' : 'grayscale-[30%]'
      } ${piece.isZombie ? 'opacity-60' : ''}`}
      style={{ 
        filter: piece.color === PlayerColors.BLACK ? 'brightness(0.7) saturate(0.8)' : undefined
      }}
      title={displayName}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={displayName} className="w-8 h-8 md:w-10 md:h-10 object-contain" draggable={false} />
      ) : (
        PIECE_SYMBOLS[piece.color][piece.type]
      )}
    </span>
  )
}
