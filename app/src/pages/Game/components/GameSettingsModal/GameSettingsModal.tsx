import { Modal } from '../../../../components/Modal'
import type { BoardSizeKey } from '../../types'
import { BotDifficulties, BoardSizeKeys } from '../../types'
import { useGameStore } from '../../../../store/gameStore'
import { useUIStore } from '../../../../store/uiStore'
import { useGameMode } from '../../../../hooks'
import { GameModes } from '../../../../constants'

interface GameSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const BOARD_SIZE_LABELS: Record<BoardSizeKey, string> = {
  [BoardSizeKeys.SMALL]: 'Small (12×12)',
  [BoardSizeKeys.MEDIUM]: 'Medium (12×16)',
  [BoardSizeKeys.LARGE]: 'Large (12×20)'
}

export const GameSettingsModal = ({ isOpen, onClose }: GameSettingsModalProps) => {
  const {
    boardSizeKey,
    botEnabled,
    botDifficulty,
    resetGame,
    toggleBot,
    setDifficulty
  } = useGameStore()

  const { is3D, toggle3D, soundEnabled, soundVolume, toggleSound, setSoundVolume } = useUIStore()
  const { showBot, mode } = useGameMode()

  const isOnline = mode === GameModes.ONLINE

  const handleBoardSizeChange = (sizeKey: BoardSizeKey) => {
    resetGame(sizeKey)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-stone-300">View mode</label>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle3D}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 overflow-hidden ${is3D ? 'bg-violet-600' : 'bg-stone-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${is3D ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className="text-xs text-stone-400 w-8">{is3D ? '3D' : '2D'}</span>
          </div>
        </div>

        {!isOnline && (
          <div>
            <label className="text-sm font-medium text-stone-300 block mb-2">Board size</label>
            <select
              value={boardSizeKey}
              onChange={(e) => handleBoardSizeChange(e.target.value as BoardSizeKey)}
              className="w-full bg-stone-700 text-amber-100 text-sm rounded-lg px-3 py-2 border border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {(Object.keys(BOARD_SIZE_LABELS) as BoardSizeKey[]).map((key) => (
                <option key={key} value={key}>
                  {BOARD_SIZE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isOnline && showBot && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-stone-300">Bot mode</label>
              <button
                onClick={toggleBot}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 overflow-hidden ${botEnabled ? 'bg-emerald-600' : 'bg-stone-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${botEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>
            {botEnabled && (
              <div>
                <label className="text-xs text-stone-400 block mb-1">Difficulty</label>
                <select
                  value={botDifficulty}
                  onChange={(e) => setDifficulty(e.target.value as typeof botDifficulty)}
                  className="w-full bg-stone-700 text-amber-100 text-sm rounded-lg px-3 py-2 border border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value={BotDifficulties.EASY}>Easy</option>
                  <option value={BotDifficulties.MEDIUM}>Medium</option>
                  <option value={BotDifficulties.HARD}>Hard</option>
                </select>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-stone-300">Sound</label>
          <button
            onClick={toggleSound}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 overflow-hidden ${soundEnabled ? 'bg-amber-600' : 'bg-stone-600'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${soundEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>

        {soundEnabled && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-stone-300">Volume</label>
              <span className="text-xs text-stone-400">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={soundVolume}
              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  )
}
