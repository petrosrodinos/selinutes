import { useMemo } from 'react'
import { useGameMode } from '../../../hooks'
import { useMyStats } from '../../../features/stats'
import { useGameStore } from '../../../store/gameStore'
import { resolvePlayerFigureTiers } from '../utils/resolvePlayerFigureTiers'

export const usePlayerFigureTiers = () => {
  const { mode } = useGameMode()
  const gameSession = useGameStore((state) => state.gameSession)
  const { data: myStats } = useMyStats()
  const myLevel = myStats?.level ?? 1

  return useMemo(
    () => resolvePlayerFigureTiers(mode, myLevel, gameSession),
    [mode, myLevel, gameSession],
  )
}
