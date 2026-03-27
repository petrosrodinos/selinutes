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
