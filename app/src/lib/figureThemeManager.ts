import type { PieceType } from '../pages/Game/types'
import { FIGURE_THEME_SOUNDS } from '../constants'

const THEME_VOLUME_SCALE = 0.4

let currentAudio: HTMLAudioElement | null = null
let currentPieceType: PieceType | null = null
let currentVolume = 0.5

const applyVolume = () => {
  if (currentAudio) currentAudio.volume = Math.min(1, currentVolume * THEME_VOLUME_SCALE)
}

export const FigureThemeManager = {
  play: (pieceType: PieceType) => {
    if (currentPieceType === pieceType && currentAudio) return

    FigureThemeManager.stop()

    const audio = new Audio(FIGURE_THEME_SOUNDS[pieceType])
    audio.loop = true
    audio.preload = 'auto'
    currentAudio = audio
    currentPieceType = pieceType
    applyVolume()
    audio.play().catch(() => {})
  },

  stop: () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }
    currentAudio = null
    currentPieceType = null
  },

  setVolume: (volume: number) => {
    currentVolume = Math.max(0, Math.min(1, volume))
    applyVolume()
  },
} as const
