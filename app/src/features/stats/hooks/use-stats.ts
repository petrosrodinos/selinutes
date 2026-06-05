import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    getMyStats,
    getStatsByUser,
    getLeaderboard,
    getAdminUsersOverview,
    getAdminGamesOverview,
    deleteAdminUser,
    deleteAdminGame,
} from '../services/stats.service'
import { toast } from 'react-toastify'

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

export const useAdminUsersOverview = () => {
    return useQuery({
        queryKey: ['stats', 'admin-users-overview'],
        queryFn: getAdminUsersOverview,
    })
}

export const useAdminGamesOverview = (params?: { page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ['stats', 'admin-games-overview', params?.page, params?.limit],
        queryFn: () => getAdminGamesOverview(params),
    })
}

export const useDeleteAdminUser = () => {
    return useMutation({
        mutationFn: deleteAdminUser,
        onSuccess: () => {
            toast.success('User deleted successfully')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}

export const useDeleteAdminGame = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteAdminGame,
        onSuccess: async () => {
            toast.success('Game deleted successfully')
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['stats', 'admin-games-overview'] }),
                queryClient.invalidateQueries({ queryKey: ['stats', 'admin-users-overview'] }),
            ])
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}
