import { useQuery } from '@tanstack/react-query'
import { getMyStats, getStatsByUser, getLeaderboard } from '../services/stats.service'

export const useMyStats = () => {
    return useQuery({
        queryKey: ['stats', 'me'],
        queryFn: getMyStats,
    })
}

export const useUserStats = (userUuid: string) => {
    return useQuery({
        queryKey: ['stats', userUuid],
        queryFn: () => getStatsByUser(userUuid),
        enabled: !!userUuid,
    })
}

export const useLeaderboard = (limit?: number) => {
    return useQuery({
        queryKey: ['stats', 'leaderboard', limit],
        queryFn: () => getLeaderboard(limit),
    })
}
