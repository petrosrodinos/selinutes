import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { createGame, getGame, joinGame } from '../services'
import { getErrorMessage } from '../../../lib/error'



export const useCreateGame = () => {
    return useMutation({
        mutationFn: createGame,
        onError: (error: any) => {
            toast.error(getErrorMessage(error))
        },
    })
}

export const useJoinGame = () => {
    return useMutation({
        mutationFn: joinGame,
        onError: (error: any) => {
            toast.error(getErrorMessage(error))
        },
    })
}

export const useGetGame = (code: string) => {
    return useQuery({
        queryKey: ['game', code],
        queryFn: () => getGame(code),
    })
}
