import type { CellContent, Position, PlayerColor } from '../../types'
import { isPiece, isObstacle, PlayerColors } from '../../types'
import { OBSTACLE_SYMBOLS, OBSTACLE_NAMES } from '../../constants'
import { getObstacle2DAssetUrl } from '../../utils/figureAssets.utils'

interface SquareProps {
  cell: CellContent
  squareSize: number
  position: Position
  isSelected: boolean
  isValidMove: boolean
  isValidAttack: boolean
  isValidSwap: boolean
  isPreviousMoveFrom: boolean
  isHint: boolean
  isHintAttack: boolean
  hasNarc?: PlayerColor | null
  isMysteryBoxSelectedObstacle?: boolean
  isMysteryBoxSelectedEmptyTile?: boolean
  isMysteryBoxSelectedFigure?: boolean
  onClick: () => void
}

export const Square = ({
  cell,
  squareSize,
  position,
  isSelected,
  isValidMove,
  isValidAttack,
  isValidSwap,
  isPreviousMoveFrom,
  isHint,
  isHintAttack,
  hasNarc = null,
  isMysteryBoxSelectedObstacle = false,
  isMysteryBoxSelectedEmptyTile = false,
  isMysteryBoxSelectedFigure = false,
  onClick
}: SquareProps) => {
  const isLight = (position.row + position.col) % 2 === 0
  const obstacleImageUrl = cell && isObstacle(cell) ? getObstacle2DAssetUrl(cell.type) : null

  const getSquareClasses = () => {
    const baseClasses = 'flex items-center justify-center cursor-pointer relative transition-all duration-200'
    
    if (cell && isObstacle(cell)) {
      if (isMysteryBoxSelectedObstacle) {
        return `${baseClasses} bg-stone-600 ring-4 ring-orange-500 ring-inset animate-pulse`
      }
      return `${baseClasses} bg-stone-600 cursor-default`
    }
    
    let colorClasses = isLight
      ? 'bg-amber-100 hover:bg-amber-200'
      : 'bg-emerald-700 hover:bg-emerald-600'

    if (isMysteryBoxSelectedEmptyTile) {
      colorClasses = 'bg-blue-400 ring-4 ring-blue-500 ring-inset animate-pulse'
    } else if (isMysteryBoxSelectedFigure) {
      colorClasses = 'bg-purple-400 ring-4 ring-purple-600 ring-inset animate-pulse'
    } else if (isSelected) {
      colorClasses = 'bg-yellow-400 ring-4 ring-yellow-500 ring-inset'
    } else if (isHintAttack) {
      colorClasses = isLight ? 'bg-rose-300' : 'bg-rose-600'
    } else if (isHint) {
      colorClasses = isLight ? 'bg-cyan-300' : 'bg-cyan-600'
    } else if (isPreviousMoveFrom) {
      colorClasses = isLight ? 'bg-sky-200/90' : 'bg-sky-800/70'
    } else if (isValidSwap) {
      colorClasses = isLight ? 'bg-violet-200 hover:bg-violet-300' : 'bg-violet-700 hover:bg-violet-600'
    } else if (isValidAttack) {
      colorClasses = isLight ? 'bg-rose-200 hover:bg-rose-300' : 'bg-rose-700 hover:bg-rose-600'
    }

    return `${baseClasses} ${colorClasses}`
  }

  return (
    <div className={getSquareClasses()} onClick={onClick} style={{ width: squareSize, height: squareSize }}>
      {cell && isObstacle(cell) && (
        <span 
          className="select-none"
          style={{ fontSize: Math.max(20, Math.round(squareSize * 0.66)) }}
          title={OBSTACLE_NAMES[cell.type]}
        >
          {obstacleImageUrl ? (
            <img
              src={obstacleImageUrl}
              alt={OBSTACLE_NAMES[cell.type]}
              className="object-contain"
              style={{
                width: Math.max(22, Math.round(squareSize * 0.82)),
                height: Math.max(22, Math.round(squareSize * 0.82)),
              }}
              draggable={false}
            />
          ) : (
            OBSTACLE_SYMBOLS[cell.type]
          )}
        </span>
      )}
      {isValidMove && (!cell || !isPiece(cell)) && (
        <div className="absolute bg-stone-800/40 rounded-full" style={{ width: Math.max(8, Math.round(squareSize * 0.26)), height: Math.max(8, Math.round(squareSize * 0.26)) }} />
      )}
      {isValidAttack && cell && isPiece(cell) && (
        <div className="absolute w-full h-full border-4 border-rose-500 rounded-sm animate-pulse" />
      )}
      {isValidSwap && cell && isPiece(cell) && (
        <div className="absolute w-full h-full border-4 border-violet-500 rounded-sm animate-pulse" />
      )}
      {isPreviousMoveFrom && (
        <div className="absolute inset-0 ring-2 ring-sky-400/80 ring-inset" />
      )}
      {(isHint || isHintAttack) && (
        <div className={`absolute inset-0 ring-4 ${isHintAttack ? 'ring-rose-400' : 'ring-cyan-400'} ring-inset animate-pulse`} />
      )}
      {hasNarc && !cell && (
        <div 
          className={`absolute w-2 h-2 rounded-full ${
            hasNarc === PlayerColors.WHITE 
              ? 'bg-amber-200/60' 
              : 'bg-stone-800/60'
          }`}
          title="Narc trap"
        />
      )}
    </div>
  )
}
