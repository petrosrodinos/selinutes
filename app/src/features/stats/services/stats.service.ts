import axiosInstance from '../../../config/api/axios'
import { ApiRoutes } from '../../../config/api/routes'
import type { UserStats, LeaderboardEntry } from '../interfaces/stats.interface'

export const getMyStats = async (): Promise<UserStats> => {
    const response = await axiosInstance.get<UserStats>(ApiRoutes.stats.me)
    return response.data
}

export const getStatsByUser = async (userUuid: string): Promise<UserStats> => {
    const response = await axiosInstance.get<UserStats>(ApiRoutes.stats.byUser(userUuid))
    return response.data
}

export const getLeaderboard = async (limit?: number): Promise<LeaderboardEntry[]> => {
    const response = await axiosInstance.get<LeaderboardEntry[]>(ApiRoutes.stats.leaderboard(limit))
    return response.data
}
