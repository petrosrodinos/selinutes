import { useState } from 'react'
import { ScrollText } from 'lucide-react'
import { Modal } from '../../../../components/Modal'
import { useGameStore } from '../../../../store/gameStore'
import { PlayerColors } from '../../types'
import { formatMoveDescription } from '../../utils/moveFormat.utils'

interface MovementLogModalProps {
  isOpen: boolean
  onClose: () => void
}

export const MovementLogModal = ({ isOpen, onClose }: MovementLogModalProps) => {
  const moveHistory = useGameStore((state) => state.gameState.moveHistory)
  const boardSize = useGameStore((state) => state.gameState.boardSize)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Movement log" size="xl">
      {moveHistory.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-400">No moves yet</p>
      ) : (
        <ol className="max-h-[min(70vh,32rem)] space-y-2 overflow-y-auto pr-1">
          {moveHistory.toReversed().map((move, index) => {
            const moveNumber = moveHistory.length - index
            const isWhite = move.piece.color === PlayerColors.WHITE
            return (
              <li
                key={`${move.piece.id}-${moveNumber}-${move.from.row}-${move.from.col}-${move.to.row}-${move.to.col}`}
                className="flex gap-3 rounded-lg border border-stone-700/80 bg-stone-900/50 px-3 py-2.5 text-sm"
              >
                <span className="w-6 shrink-0 tabular-nums text-stone-500">{moveNumber}.</span>
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isWhite ? 'bg-stone-100 ring-1 ring-amber-200/40' : 'bg-stone-900 ring-1 ring-amber-900/50'}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-amber-100/95">{isWhite ? 'White' : 'Black'}</p>
                  <p className="mt-0.5 break-words text-stone-300">{formatMoveDescription(move, boardSize)}</p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </Modal>
  )
}

export const MovementLogButton = ({ className = '' }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const moveCount = useGameStore((state) => state.gameState.moveHistory.length)

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          setIsOpen(true)
        }}
        aria-label="Open movement log"
        className={`inline-flex shrink-0 touch-manipulation items-center gap-1.5 rounded-lg border border-stone-600/80 bg-stone-800/80 px-2.5 py-1.5 text-xs font-medium text-amber-200/90 transition-colors hover:border-amber-700/50 hover:bg-stone-700/80 hover:text-amber-100 ${className}`}
      >
        <ScrollText className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>Log</span>
        {moveCount > 0 && (
          <span className="rounded-full bg-stone-700/90 px-1.5 py-px text-[10px] tabular-nums text-stone-300">{moveCount}</span>
        )}
      </button>
      <MovementLogModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
