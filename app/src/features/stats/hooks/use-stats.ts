import { useMutation, useQuery } from '@tanstack/react-query'
import { getMyStats, getStatsByUser, getLeaderboard, getAdminUsersOverview, deleteAdminUser } from '../services/stats.service'
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
