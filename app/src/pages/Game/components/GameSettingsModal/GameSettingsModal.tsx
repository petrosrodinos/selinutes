import { LogOut } from 'lucide-react'
import { Modal } from '../../../../components/Modal'
import { Select, type SelectOption } from '../../../../components/ui/Select'
import type { BoardSizeKey, BotDifficulty } from '../../types'
import { BotDifficulties, BoardSizeKeys } from '../../types'
import { useGameStore } from '../../../../store/gameStore'
import { useUIStore } from '../../../../store/uiStore'
import { useGameMode } from '../../../../hooks'
import { GameModes } from '../../../../constants'

interface GameSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  /** Opens the shared leave confirmation dialog (owned by Game). */
  onRequestLeave: () => void
}

const BOARD_SIZE_LABELS: Record<BoardSizeKey, string> = {
  [BoardSizeKeys.SMALL]: 'Small (12×12)',
  [BoardSizeKeys.MEDIUM]: 'Medium (12×16)',
  [BoardSizeKeys.LARGE]: 'Large (12×20)'
}

const BOARD_SIZE_OPTIONS: SelectOption<BoardSizeKey>[] = (Object.keys(BOARD_SIZE_LABELS) as BoardSizeKey[]).map((key) => ({
  value: key,
  label: BOARD_SIZE_LABELS[key]
}))

const BOT_DIFFICULTY_OPTIONS: SelectOption<BotDifficulty>[] = [
  { value: BotDifficulties.EASY, label: 'Easy' },
  { value: BotDifficulties.MEDIUM, label: 'Medium' },
  { value: BotDifficulties.HARD, label: 'Hard' }
]

export const GameSettingsModal = ({ isOpen, onClose, onRequestLeave }: GameSettingsModalProps) => {
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
      <div className="space-y-4 sm:space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <label className="text-sm font-medium text-stone-300">View mode</label>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggle3D}
              className={`relative h-7 w-12 overflow-hidden rounded-full transition-colors duration-200 sm:h-7 sm:w-14 ${is3D ? 'bg-violet-600' : 'bg-stone-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${is3D ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className="w-8 text-xs text-stone-400">{is3D ? '3D' : '2D'}</span>
          </div>
        </div>

        {!isOnline && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-300 sm:mb-2">Board size</label>
            <Select
              value={boardSizeKey}
              options={BOARD_SIZE_OPTIONS}
              onChange={handleBoardSizeChange}
              ariaLabel="Board size"
            />
          </div>
        )}

        {!isOnline && showBot && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <label className="text-sm font-medium text-stone-300">Bot mode</label>
              <button
                type="button"
                onClick={toggleBot}
                className={`relative ml-auto h-7 w-12 overflow-hidden rounded-full transition-colors duration-200 sm:w-14 ${botEnabled ? 'bg-emerald-600' : 'bg-stone-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${botEnabled ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>
            {botEnabled && (
              <div>
                <label className="mb-1 block text-xs text-stone-400">Difficulty</label>
                <Select
                  value={botDifficulty}
                  options={BOT_DIFFICULTY_OPTIONS}
                  onChange={setDifficulty}
                  ariaLabel="Bot difficulty"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <label className="text-sm font-medium text-stone-300">Sound</label>
          <button
            type="button"
            onClick={toggleSound}
            className={`relative ml-auto h-7 w-12 overflow-hidden rounded-full transition-colors duration-200 sm:w-14 ${soundEnabled ? 'bg-amber-600' : 'bg-stone-600'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${soundEnabled ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>

        {soundEnabled && (
          <div>
            <div className="mb-1 flex items-center justify-between">
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
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-stone-600 accent-amber-500"
            />
          </div>
        )}

        <div className="space-y-3 border-t border-stone-700 pt-4">
          <button
            type="button"
            onClick={onRequestLeave}
            className="flex w-full touch-manipulation items-center justify-center gap-2 rounded-lg border border-rose-500/50 bg-rose-600/90 py-2.5 text-sm font-medium text-white transition hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/80"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Leave game
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-stone-700 py-2.5 text-sm font-medium text-stone-200 transition hover:bg-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/80"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  )
}
