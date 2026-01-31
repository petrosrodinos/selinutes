export const GameModes = {
    SINGLE: 'single',
    OFFLINE_2P: 'offline-2p',
    CREATE: 'create',
    JOIN: 'join'
} as const

export type GameMode = typeof GameModes[keyof typeof GameModes]

export const GAME_MODE_CONFIG = {
    [GameModes.SINGLE]: {
        label: 'Single Player',
        showBot: true,
        showDev: true
    },
    [GameModes.OFFLINE_2P]: {
        label: '2 Players Offline',
        showBot: false,
        showDev: false
    },
    [GameModes.CREATE]: {
        label: 'Create Game',
        showBot: false,
        showDev: false
    },
    [GameModes.JOIN]: {
        label: 'Join Game',
        showBot: false,
        showDev: false
    }
} as const
