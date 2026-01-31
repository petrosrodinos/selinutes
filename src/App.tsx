import { useEffect } from 'react'
import { Board, Board3D, TopMenu, BottomMenu, RightSidebar } from './features/chess'
import { Modal } from './components/Modal'
import { useGameStore } from './store/gameStore'
import { useUIStore } from './store/uiStore'
import { PlayerColors } from './features/chess/types'
import { BOT_DELAY } from './features/chess/constants'

function App() {
  const { gameState, botEnabled, botDifficulty, botThinking, processBotMove } = useGameStore()
  const { is3D, isTopMenuOpen, isRightMenuOpen, openTopMenu, closeTopMenu, openRightMenu, closeRightMenu } = useUIStore()

  // Bot move effect
  useEffect(() => {
    if (!botEnabled) return
    if (gameState.currentPlayer !== PlayerColors.BLACK) return
    if (gameState.gameOver) return
    if (botThinking) return

    const timer = setTimeout(() => {
      processBotMove()
    }, BOT_DELAY[botDifficulty])

    return () => clearTimeout(timer)
  }, [botEnabled, botDifficulty, gameState.currentPlayer, gameState.gameOver, botThinking])

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
          Selinutes
        </h1>

        <div className="lg:hidden mb-4">
          <div className={`px-4 py-2 rounded-lg text-sm font-medium text-center ${
            gameState.gameOver
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}>
            {gameState.gameOver && gameState.winner
              ? `${gameState.winner === 'white' ? 'White' : 'Black'} Wins!`
              : gameState.gameOver
              ? 'Game Over'
              : `${gameState.currentPlayer === 'white' ? 'White' : 'Black'}'s Turn`}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-1 items-start justify-center">
          <div className="flex flex-col items-center w-full">
            <div className="hidden lg:block  mb-2">
              <TopMenu />
            </div>

            {is3D ? <Board3D /> : <Board />}

            <BottomMenu />
          </div>

          <div className="hidden lg:block w-full lg:w-64 flex-shrink-0">
            <RightSidebar />
          </div>
        </div>

        <div className="fixed bottom-20 right-4 lg:hidden flex flex-col gap-2 z-40">
          <button
            onClick={openTopMenu}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-full p-3 shadow-lg transition-colors"
            aria-label="Open game settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={openRightMenu}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-full p-3 shadow-lg transition-colors"
            aria-label="Open game info"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        <Modal
          isOpen={isTopMenuOpen}
          onClose={closeTopMenu}
          title="Game Settings"
        >
          <TopMenu />
        </Modal>

        <Modal
          isOpen={isRightMenuOpen}
          onClose={closeRightMenu}
          title="Game Info"
        >
          <RightSidebar />
        </Modal>
      </div>
    </div>
  )
}

export default App
