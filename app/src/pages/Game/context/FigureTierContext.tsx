import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import type { FigureTierKey } from '../../../constants/figures'
import type { PlayerColor } from '../types'
import { usePlayerFigureTiers } from '../hooks/usePlayerFigureTiers'
import {
  DEFAULT_PLAYER_FIGURE_TIERS,
  type PlayerFigureTiersByColor,
} from '../utils/resolvePlayerFigureTiers'

type FigureTierContextValue = {
  tiersByColor: PlayerFigureTiersByColor
  getTierForColor: (color: PlayerColor) => FigureTierKey
}

const FigureTierContext = createContext<FigureTierContextValue>({
  tiersByColor: DEFAULT_PLAYER_FIGURE_TIERS,
  getTierForColor: (color) => DEFAULT_PLAYER_FIGURE_TIERS[color],
})

export const FigureTierProvider = ({ children }: { children: ReactNode }) => {
  const tiersByColor = usePlayerFigureTiers()

  const getTierForColor = useCallback(
    (color: PlayerColor) => tiersByColor[color],
    [tiersByColor],
  )

  const value = useMemo(
    () => ({ tiersByColor, getTierForColor }),
    [tiersByColor, getTierForColor],
  )

  return <FigureTierContext.Provider value={value}>{children}</FigureTierContext.Provider>
}

export const useFigureTiers = () => useContext(FigureTierContext)
