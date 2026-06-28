import { describe, expect, it } from 'vitest'
import { FigureTiers } from '../../../../constants/figures'
import { GameModes } from '../../../../constants'
import { PlayerColors } from '../../types'
import { resolvePlayerFigureTiers } from '../resolvePlayerFigureTiers'
import type { GameSession } from '../../../../features/game/interfaces'

const createSession = (whiteLevel: number, blackLevel: number): GameSession => ({
  code: 'ABC123',
  boardSizeKey: '12x12',
  boardSize: { rows: 12, cols: 12 },
  status: 'in_progress',
  players: [
    { id: 'white-id', name: 'White', color: PlayerColors.WHITE, joinedAt: new Date(), level: whiteLevel },
    { id: 'black-id', name: 'Black', color: PlayerColors.BLACK, joinedAt: new Date(), level: blackLevel },
  ],
  createdAt: new Date(),
  hostPlayerId: 'white-id',
})

describe('resolvePlayerFigureTiers', () => {
  it('maps online players to their own tiers', () => {
    const tiers = resolvePlayerFigureTiers(GameModes.ONLINE, 1, createSession(15, 25))

    expect(tiers[PlayerColors.WHITE]).toBe(FigureTiers.TIER2)
    expect(tiers[PlayerColors.BLACK]).toBe(FigureTiers.TIER3)
  })

  it('uses user tier for white and tier1 for bot in single player', () => {
    const tiers = resolvePlayerFigureTiers(GameModes.SINGLE, 20, null)

    expect(tiers[PlayerColors.WHITE]).toBe(FigureTiers.TIER3)
    expect(tiers[PlayerColors.BLACK]).toBe(FigureTiers.TIER1)
  })

  it('uses user tier for both sides in offline 2P', () => {
    const tiers = resolvePlayerFigureTiers(GameModes.OFFLINE, 40, null)

    expect(tiers[PlayerColors.WHITE]).toBe(FigureTiers.TIER5)
    expect(tiers[PlayerColors.BLACK]).toBe(FigureTiers.TIER5)
  })

  it('defaults to tier1 when player level is missing in session', () => {
    const session = createSession(15, 25)
    session.players[0].level = undefined as unknown as number

    const tiers = resolvePlayerFigureTiers(GameModes.ONLINE, 1, session)

    expect(tiers[PlayerColors.WHITE]).toBe(FigureTiers.TIER1)
    expect(tiers[PlayerColors.BLACK]).toBe(FigureTiers.TIER3)
  })
})
