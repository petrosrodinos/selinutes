export const ADMIN_TABS = {
    USERS: 'users',
    GAMES: 'games',
} as const

export type AdminTab = (typeof ADMIN_TABS)[keyof typeof ADMIN_TABS]

export const ADMIN_TAB_OPTIONS = [
    { value: ADMIN_TABS.USERS, label: 'Users' },
    { value: ADMIN_TABS.GAMES, label: 'Games' },
] as const

export const ADMIN_GAMES_PAGE_LIMIT = 12
