import { useEffect } from 'react'
import type { PieceType } from '../pages/Game/types'
import { FigureThemeManager } from '../lib/figureThemeManager'
import { useUIStore } from '../store/uiStore'

export const useFigureThemeSound = (selectedPieceType: PieceType | null) => {
  const soundEnabled = useUIStore(state => state.soundEnabled)
  const soundVolume = useUIStore(state => state.soundVolume)

  useEffect(() => {
    FigureThemeManager.setVolume(soundVolume)
  }, [soundVolume])

  useEffect(() => {
    if (!selectedPieceType || !soundEnabled) {
      FigureThemeManager.stop()
      return
    }

    FigureThemeManager.play(selectedPieceType)
  }, [selectedPieceType, soundEnabled])

  useEffect(() => () => FigureThemeManager.stop(), [])
}
