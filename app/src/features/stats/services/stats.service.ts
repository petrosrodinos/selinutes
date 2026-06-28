import axiosInstance from '../../../config/api/axios'
import { ApiRoutes } from '../../../config/api/routes'
import type {
    UserStats,
    LeaderboardEntry,
    AdminUserOverviewEntry,
    AdminGamesOverviewResponse,
} from '../interfaces/stats.interface'
import type { UpdateAdminUserPayload } from '../interfaces/admin-user-update.interface'

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

export const getAdminUsersOverview = async (): Promise<AdminUserOverviewEntry[]> => {
    const response = await axiosInstance.get<AdminUserOverviewEntry[]>(ApiRoutes.stats.adminUsersOverview)
    return response.data
}

export const getAdminGamesOverview = async (params?: {
    page?: number
    limit?: number
}): Promise<AdminGamesOverviewResponse> => {
    const response = await axiosInstance.get<AdminGamesOverviewResponse>(
        ApiRoutes.stats.adminGamesOverview(params?.page, params?.limit),
    )
    return response.data
}

export const deleteAdminGame = async (sessionId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>(
        ApiRoutes.stats.adminDeleteGame(sessionId),
    )
    return response.data
}

export const deleteAdminUser = async (userUuid: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>(ApiRoutes.stats.adminDeleteUser(userUuid))
    return response.data
}

export const updateAdminUser = async (
    userUuid: string,
    payload: UpdateAdminUserPayload,
): Promise<AdminUserOverviewEntry> => {
    const response = await axiosInstance.patch<AdminUserOverviewEntry>(
        ApiRoutes.stats.adminUpdateUser(userUuid),
        payload,
    )
    return response.data
}
