import type { BotDifficulty, BoardSizeKey, PlayerColor } from '../../types'
import { BotDifficulties, BoardSizeKeys, PlayerColors } from '../../types'

interface TopMenuProps {
  currentPlayer: PlayerColor
  gameOver: boolean
  winner: PlayerColor | null
  boardSizeKey: BoardSizeKey
  is3D: boolean
  botEnabled: boolean
  botThinking: boolean
  botDifficulty: BotDifficulty
  onBoardSizeChange: (sizeKey: BoardSizeKey) => void
  onToggle3D: () => void
  onToggleBot: () => void
  onDifficultyChange: (difficulty: BotDifficulty) => void
}

export const TopMenu = ({
  currentPlayer,
  gameOver,
  winner,
  boardSizeKey,
  is3D,
  botEnabled,
  botThinking,
  botDifficulty,
  onBoardSizeChange,
  onToggle3D,
  onToggleBot,
  onDifficultyChange
}: TopMenuProps) => {
  const boardSizeOptions: BoardSizeKey[] = [BoardSizeKeys.SMALL, BoardSizeKeys.MEDIUM, BoardSizeKeys.LARGE]

  const getStatusText = () => {
    if (gameOver && winner) {
      return `${winner === PlayerColors.WHITE ? 'White' : 'Black'} Wins!`
    }
    if (gameOver) {
      return 'Game Over'
    }
    return `${currentPlayer === PlayerColors.WHITE ? 'White' : 'Black'}'s Turn`
  }

  return (
    <div className="bg-stone-800/80 backdrop-blur rounded-xl p-3 border border-stone-700">
      <div className="flex flex-wrap items-center gap-4 justify-center">
        <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
          gameOver
            ? 'bg-rose-600 text-white'
            : 'bg-emerald-600 text-white'
        }`}>
          {getStatusText()}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-amber-200">Size:</span>
          <div className="flex gap-1">
            {boardSizeOptions.map((sizeKey) => (
              <button
                key={sizeKey}
                onClick={() => onBoardSizeChange(sizeKey)}
                className={`py-1 px-2 text-xs font-medium rounded transition-all duration-200 ${
                  boardSizeKey === sizeKey
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                }`}
              >
                {sizeKey}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-amber-200">View:</span>
          <button
            onClick={onToggle3D}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
              is3D ? 'bg-violet-600' : 'bg-stone-600'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                is3D ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-xs text-stone-300">{is3D ? '3D' : '2D'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-amber-200">Bot:</span>
          <button
            onClick={onToggleBot}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
              botEnabled ? 'bg-emerald-600' : 'bg-stone-600'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                botEnabled ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          {botEnabled && (
            <select
              value={botDifficulty}
              onChange={(e) => onDifficultyChange(e.target.value as BotDifficulty)}
              className="bg-stone-700 text-amber-100 text-xs rounded px-2 py-1 border border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value={BotDifficulties.EASY}>Easy</option>
              <option value={BotDifficulties.MEDIUM}>Medium</option>
              <option value={BotDifficulties.HARD}>Hard</option>
            </select>
          )}
          {botThinking && (
            <span className="text-xs text-stone-400">Thinking...</span>
          )}
        </div>
      </div>
    </div>
  )
}
