import { useState } from 'react'
import { Lightbulb, Undo2, RotateCcw } from 'lucide-react'
import { useGameStore } from '../../../../store/gameStore'
import { Modal } from '../../../../components/Modal'

export const BottomMenu = () => {
  const { canUndo, canHint, undoMove, showHint, resetGame } = useGameStore()
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false)

  const handleNewGameClick = () => setIsNewGameModalOpen(true)
  const handleConfirmNewGame = () => {
    setIsNewGameModalOpen(false)
    resetGame()
  }
  const handleCancelNewGame = () => setIsNewGameModalOpen(false)

  return (
    <>
      <div className="bg-stone-800/80 backdrop-blur rounded-xl p-4 border border-stone-700 mt-4">
        <div className="flex gap-3 justify-center">
          <button
            onClick={showHint}
            disabled={!canHint()}
            className={`flex items-center gap-2 py-2 px-6 font-medium rounded-lg transition-all duration-200 ${
              canHint()
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-stone-700 text-stone-500 cursor-not-allowed'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Hint
          </button>
          <button
            onClick={undoMove}
            disabled={!canUndo()}
            className={`flex items-center gap-2 py-2 px-6 font-medium rounded-lg transition-all duration-200 ${
              canUndo()
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-stone-700 text-stone-500 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
          <button
            onClick={handleNewGameClick}
            className="flex items-center gap-2 py-2 px-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-rose-500/25"
          >
            <RotateCcw className="w-4 h-4" />
            New Game
          </button>
        </div>
      </div>

      <Modal isOpen={isNewGameModalOpen} onClose={handleCancelNewGame} title="New Game">
        <div className="space-y-4">
          <p className="text-stone-300">
            Starting a new game will reset the board and clear your current progress. All moves and piece positions will be lost. Are you sure you want to continue?
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={handleCancelNewGame} className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleConfirmNewGame} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors">
              Start New Game
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
