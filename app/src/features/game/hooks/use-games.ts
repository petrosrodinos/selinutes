import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { createGame, finishGame, getGame, joinGame, saveOfflineGame, getGames, getGameRecord } from '../services'
import { getErrorMessage } from '../../../lib/error'
import type { GetGamesParams } from '../interfaces'



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

export const useFinishGame = () => {
    return useMutation({
        mutationFn: finishGame,
        onError: (error: any) => {
            console.error('Failed to save game result:', getErrorMessage(error))
        },
    })
}

export const useSaveOfflineGame = () => {
    return useMutation({
        mutationFn: saveOfflineGame,
        onError: (error: any) => {
            console.error('Failed to save offline game result:', getErrorMessage(error))
        },
    })
}

export const useGetGames = (params?: GetGamesParams) => {
    return useQuery({
        queryKey: ['games', params],
        queryFn: () => getGames(params),
        enabled: true,
    })
}

export const useGetGameRecord = (uuid: string) => {
    return useQuery({
        queryKey: ['game-record', uuid],
        queryFn: () => getGameRecord(uuid),
        enabled: !!uuid,
    })
}
