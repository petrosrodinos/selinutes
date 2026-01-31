import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GameModes, GAME_MODE_CONFIG } from '../constants'
import type { GameMode } from '../constants'

export const useGameMode = () => {
    const [searchParams] = useSearchParams()

    const mode = useMemo(() => {
        const modeParam = searchParams.get('mode')
        if (modeParam && Object.values(GameModes).includes(modeParam as GameMode)) {
            return modeParam as GameMode
        }
        return GameModes.SINGLE
    }, [searchParams])

    const config = GAME_MODE_CONFIG[mode]

    return {
        mode,
        label: config.label,
        showBot: config.showBot,
        showDev: config.showDev
    }
}
