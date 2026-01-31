import { useState } from 'react'
import { useGame, Board, Board3D, TopMenu, BottomMenu, RightSidebar } from './features/chess'
import type { BoardSizeKey } from './features/chess/types'
import { Modal } from './components/Modal'

function App() {
  const [is3D, setIs3D] = useState(true)
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false)
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false)

  const {
    gameState,
    boardSizeKey,
    botEnabled,
    botThinking,
    botDifficulty,
    canUndo,
    hintMove,
    canHint,
    selectSquare,
    resetGame,
    toggleBot,
    setDifficulty,
    undoMove,
    showHint
  } = useGame()

  const toggle3D = () => setIs3D(prev => !prev)

  const handleBoardSizeChange = (sizeKey: BoardSizeKey) => {
    resetGame(sizeKey)
  }

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
              <TopMenu
                currentPlayer={gameState.currentPlayer}
                gameOver={gameState.gameOver}
                winner={gameState.winner}
                boardSizeKey={boardSizeKey}
                is3D={is3D}
                botEnabled={botEnabled}
                botThinking={botThinking}
                botDifficulty={botDifficulty}
                onBoardSizeChange={handleBoardSizeChange}
                onToggle3D={toggle3D}
                onToggleBot={toggleBot}
                onDifficultyChange={setDifficulty}
              />
            </div>

            {is3D ? (
              <Board3D
                board={gameState.board}
                boardSize={gameState.boardSize}
                selectedPosition={gameState.selectedPosition}
                validMoves={gameState.validMoves}
                validAttacks={gameState.validAttacks}
                lastMove={gameState.lastMove}
                hintMove={hintMove}
                onSquareClick={selectSquare}
              />
            ) : (
              <Board
                board={gameState.board}
                boardSize={gameState.boardSize}
                selectedPosition={gameState.selectedPosition}
                validMoves={gameState.validMoves}
                validAttacks={gameState.validAttacks}
                lastMove={gameState.lastMove}
                hintMove={hintMove}
                onSquareClick={selectSquare}
              />
            )}

            <BottomMenu
              canUndo={canUndo}
              canHint={canHint}
              onUndo={undoMove}
              onHint={showHint}
              onReset={() => resetGame()}
            />
          </div>

          <div className="hidden lg:block w-full lg:w-64 flex-shrink-0">
            <RightSidebar
              boardSizeKey={boardSizeKey}
              capturedPieces={gameState.capturedPieces}
              moveHistory={gameState.moveHistory}
            />
          </div>
        </div>

        <div className="fixed bottom-20 right-4 lg:hidden flex flex-col gap-2 z-40">
          <button
            onClick={() => setIsTopMenuOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-full p-3 shadow-lg transition-colors"
            aria-label="Open game settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={() => setIsRightMenuOpen(true)}
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
          onClose={() => setIsTopMenuOpen(false)}
          title="Game Settings"
        >
          <TopMenu
            currentPlayer={gameState.currentPlayer}
            gameOver={gameState.gameOver}
            winner={gameState.winner}
            boardSizeKey={boardSizeKey}
            is3D={is3D}
            botEnabled={botEnabled}
            botThinking={botThinking}
            botDifficulty={botDifficulty}
            onBoardSizeChange={(size) => {
              handleBoardSizeChange(size)
              setIsTopMenuOpen(false)
            }}
            onToggle3D={toggle3D}
            onToggleBot={toggleBot}
            onDifficultyChange={setDifficulty}
          />
        </Modal>

        <Modal
          isOpen={isRightMenuOpen}
          onClose={() => setIsRightMenuOpen(false)}
          title="Game Info"
        >
          <RightSidebar
            boardSizeKey={boardSizeKey}
            capturedPieces={gameState.capturedPieces}
            moveHistory={gameState.moveHistory}
          />
        </Modal>
      </div>
    </div>
  )
}

export default App
