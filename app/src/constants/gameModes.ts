export const GameModes = {
    SINGLE: 'single',
    OFFLINE: 'offline',
    ONLINE: 'online'
} as const

export type GameMode = typeof GameModes[keyof typeof GameModes]

export const GAME_MODE_CONFIG = {
    [GameModes.SINGLE]: {
        label: 'Single Player',
        showBot: true,
        showDev: true
    },
    [GameModes.OFFLINE]: {
        label: 'Offline',
        showBot: false,
        showDev: false
    },
    [GameModes.ONLINE]: {
        label: 'Online',
        showBot: false,
        showDev: false
    }
} as const
