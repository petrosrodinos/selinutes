import { FigureTiers, getFigureTierFromPlayerLevel, type FigureTierKey } from '../../../constants/figures'
import { GameModes, type GameMode } from '../../../constants'
import { PlayerColors, type PlayerColor } from '../types'
import type { GameSession } from '../../../features/game/interfaces'

export type PlayerFigureTiersByColor = Record<PlayerColor, FigureTierKey>

export const DEFAULT_PLAYER_FIGURE_TIERS: PlayerFigureTiersByColor = {
  [PlayerColors.WHITE]: FigureTiers.TIER1,
  [PlayerColors.BLACK]: FigureTiers.TIER1,
}

export const resolvePlayerFigureTiers = (
  mode: GameMode,
  myLevel: number,
  gameSession: GameSession | null,
): PlayerFigureTiersByColor => {
  if (mode === GameModes.ONLINE && gameSession) {
    const whitePlayer = gameSession.players.find((player) => player.color === PlayerColors.WHITE)
    const blackPlayer = gameSession.players.find((player) => player.color === PlayerColors.BLACK)

    return {
      [PlayerColors.WHITE]: getFigureTierFromPlayerLevel(whitePlayer?.level ?? 1),
      [PlayerColors.BLACK]: getFigureTierFromPlayerLevel(blackPlayer?.level ?? 1),
    }
  }

  const userTier = getFigureTierFromPlayerLevel(myLevel)

  if (mode === GameModes.SINGLE) {
    return {
      [PlayerColors.WHITE]: userTier,
      [PlayerColors.BLACK]: FigureTiers.TIER1,
    }
  }

  if (mode === GameModes.OFFLINE) {
    return {
      [PlayerColors.WHITE]: userTier,
      [PlayerColors.BLACK]: userTier,
    }
  }

  return DEFAULT_PLAYER_FIGURE_TIERS
}
