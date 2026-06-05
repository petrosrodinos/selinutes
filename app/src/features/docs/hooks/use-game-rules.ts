import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getGameRules, updateGameRules } from '../services/docs.service'
import { toast } from 'react-toastify'

export const useGameRules = () => {
    return useQuery({
        queryKey: ['docs', 'game-rules'],
        queryFn: getGameRules,
    })
}

export const useUpdateGameRules = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateGameRules,
        onSuccess: async () => {
            toast.success('Game rules saved successfully')
            await queryClient.invalidateQueries({ queryKey: ['docs', 'game-rules'] })
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}
