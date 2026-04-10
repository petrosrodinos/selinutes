import axiosInstance from '../../../config/api/axios'
import { ApiRoutes } from '../../../config/api/routes'
import type { CreateGameRequest, JoinGameRequest, GameSession, SaveOfflineGameRequest, GetGamesParams, PaginatedGamesResponse, GameRecord } from '../interfaces'

export const createGame = async (data: CreateGameRequest): Promise<GameSession> => {
    try {
        const response = await axiosInstance.post<GameSession>(ApiRoutes.games.create, data)
        return response.data
    } catch (error) {
        throw error
    }
}

export const joinGame = async (data: JoinGameRequest): Promise<GameSession> => {
    try {
        const response = await axiosInstance.post<GameSession>(ApiRoutes.games.join, data)
        return response.data
    } catch (error) {
        throw error
    }
}

export const getGame = async (code: string): Promise<GameSession> => {
    try {
        const response = await axiosInstance.get<GameSession>(ApiRoutes.games.get(code))
        return response.data
    } catch (error) {
        throw error
    }
}

export const finishGame = async (code: string): Promise<void> => {
    try {
        await axiosInstance.post(ApiRoutes.games.finish(code))
    } catch (error) {
        throw error
    }
}

export const saveOfflineGame = async (data: SaveOfflineGameRequest): Promise<void> => {
    try {
        await axiosInstance.post(ApiRoutes.games.finishOffline, data)
    } catch (error) {
        throw error
    }
}

export const getGames = async (params?: GetGamesParams): Promise<PaginatedGamesResponse> => {
    const response = await axiosInstance.get<PaginatedGamesResponse>(ApiRoutes.games.list(params as Record<string, string | number | undefined>))
    return response.data
}

export const getGameRecord = async (uuid: string): Promise<GameRecord> => {
    const response = await axiosInstance.get<GameRecord>(ApiRoutes.games.record(uuid))
    return response.data
}
