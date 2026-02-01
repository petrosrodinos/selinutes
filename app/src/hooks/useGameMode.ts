import { useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GameModes, GAME_MODE_CONFIG } from '../constants'
import type { GameMode } from '../constants'

export const useGameMode = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const hasCode = searchParams.has('code')

    useEffect(() => {
        if (hasCode && searchParams.get('mode') !== GameModes.ONLINE) {
            searchParams.set('mode', GameModes.ONLINE)
            setSearchParams(searchParams, { replace: true })
        }
    }, [hasCode, searchParams, setSearchParams])

    const mode = useMemo(() => {
        if (hasCode) {
            return GameModes.ONLINE
        }
        const modeParam = searchParams.get('mode')
        if (modeParam && Object.values(GameModes).includes(modeParam as GameMode)) {
            return modeParam as GameMode
        }
        return GameModes.SINGLE
    }, [searchParams, hasCode])

    const config = GAME_MODE_CONFIG[mode]

    return {
        mode,
        label: config.label,
        showBot: config.showBot,
        showDev: config.showDev
    }
}
