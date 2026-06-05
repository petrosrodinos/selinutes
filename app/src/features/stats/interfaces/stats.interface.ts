export interface UserStats {
    id: number
    user_uuid: string
    rank: number
    level: number
    points: number
    wins: number
    losses: number
    draws: number
    created_at: string
    updated_at: string
}

export interface LeaderboardEntry {
    rank: number
    user_uuid: string
    username: string
    points: number
    level: number
    wins: number
    losses: number
    draws: number
}

export interface AdminGamePlayerEntry {
    user_uuid: string
    username: string
    status: string
    points: number
    moves: number
    time: number | null
    game_uuid: string
}

export interface AdminGameSessionEntry {
    id: string
    code: string | null
    board_size: string
    mode: 'SINGLE' | 'OFFLINE' | 'ONLINE'
    players: AdminGamePlayerEntry[]
    created_at: string
    finished_at: string | null
}

export interface AdminGamesOverviewResponse {
    data: AdminGameSessionEntry[]
    total: number
    page: number
    limit: number
}

export interface AdminUserOverviewEntry {
    user_uuid: string
    username: string
    email: string
    role: string
    games_played: number
    online_games_played: number
    non_online_games_played: number
    points: number
    level: number
    wins: number
    losses: number
    draws: number
    rank: number
    created_at: string
    updated_at: string
}
