import { Modal } from '../../../../components/Modal'
import { useUIStore } from '../../../../store/uiStore'
import { useGameStore } from '../../../../store/gameStore'
import { DEV_TOOLS_OPTION_LABELS, DEV_TOOLS_OPTIONS } from '../../config/dev-tools.config'

interface DevToolsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DevToolsModal = ({ isOpen, onClose }: DevToolsModalProps) => {
  const { devMode, toggleDevMode, showObstacles, toggleShowObstacles } = useUIStore()
  const shuffleFigures = useGameStore((state) => state.shuffleFigures)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dev tools">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <label className="text-sm font-medium text-stone-300">
            {DEV_TOOLS_OPTION_LABELS[DEV_TOOLS_OPTIONS.DEV_MODE]}
          </label>
          <button
            type="button"
            onClick={toggleDevMode}
            className={`relative ml-auto h-7 w-12 overflow-hidden rounded-full transition-colors duration-200 sm:w-14 ${devMode ? 'bg-orange-600' : 'bg-stone-600'}`}
            aria-label={devMode ? 'Disable dev mode' : 'Enable dev mode'}
            aria-pressed={devMode}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${devMode ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0'}`}
            />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <label className="text-sm font-medium text-stone-300">
            {DEV_TOOLS_OPTION_LABELS[DEV_TOOLS_OPTIONS.SHOW_OBSTACLES]}
          </label>
          <button
            type="button"
            onClick={toggleShowObstacles}
            className={`relative ml-auto h-7 w-12 overflow-hidden rounded-full transition-colors duration-200 sm:w-14 ${showObstacles ? 'bg-orange-600' : 'bg-stone-600'}`}
            aria-label={showObstacles ? 'Hide obstacles' : 'Show obstacles'}
            aria-pressed={showObstacles}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${showObstacles ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0'}`}
            />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <label className="text-sm font-medium text-stone-300">
            {DEV_TOOLS_OPTION_LABELS[DEV_TOOLS_OPTIONS.SHUFFLE_FIGURES]}
          </label>
          <button
            type="button"
            onClick={shuffleFigures}
            className="ml-auto rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-orange-500"
          >
            Shuffle
          </button>
        </div>
      </div>
    </Modal>
  )
}
