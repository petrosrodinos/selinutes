import { motion } from 'framer-motion'
import type { Piece as PieceType, Position } from '../../types'
import { PlayerColors } from '../../types'
import { PIECE_SYMBOLS, PIECE_NAMES } from '../../constants'
import { getPiece2DAssetUrlForTiers } from '../../utils/figureAssets.utils'
import { useFigureTiers } from '../../context/FigureTierContext'

interface AnimatedPieceProps {
  piece: PieceType
  position: Position
  squareSize: number
  onClick: () => void
}

export const AnimatedPiece = ({ piece, position, squareSize, onClick }: AnimatedPieceProps) => {
  const { tiersByColor } = useFigureTiers()
  const pieceName = PIECE_NAMES[piece.type]
  const displayName = piece.isZombie ? `${pieceName} (Zombie)` : pieceName
  const imageUrl = getPiece2DAssetUrlForTiers(piece.type, piece.color, tiersByColor)

  const x = position.col * squareSize
  const y = position.row * squareSize

  return (
    <motion.div
      className="absolute pointer-events-auto cursor-pointer"
      layout
      initial={false}
      animate={{ x, y }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 0.8
      }}
      style={{
        left: 0,
        top: 0,
        width: squareSize,
        height: squareSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
      }}
      title={displayName}
      onClick={onClick}
    >
      <span
        className={`select-none drop-shadow-lg ${
          piece.color === PlayerColors.WHITE ? '' : 'grayscale-[30%]'
        } ${piece.isZombie ? 'opacity-60' : ''}`}
        style={{
          fontSize: Math.max(20, Math.round(squareSize * 0.66)),
          filter: piece.color === PlayerColors.BLACK ? 'brightness(0.7) saturate(0.8)' : undefined
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={displayName}
            className="object-contain"
            style={{ width: Math.max(22, Math.round(squareSize * 0.88)), height: Math.max(22, Math.round(squareSize * 0.88)) }}
            draggable={false}
          />
        ) : (
          PIECE_SYMBOLS[piece.color][piece.type]
        )}
      </span>
    </motion.div>
  )
}
