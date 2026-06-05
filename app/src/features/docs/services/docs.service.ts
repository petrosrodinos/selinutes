import axiosInstance from '../../../config/api/axios'
import { ApiRoutes } from '../../../config/api/routes'
import type { GameRulesContent } from '../interfaces/docs.interface'

export const getGameRules = async (): Promise<GameRulesContent> => {
    const response = await axiosInstance.get<GameRulesContent>(ApiRoutes.docs.gameRules)
    return response.data
}

export const updateGameRules = async (content: string): Promise<GameRulesContent> => {
    const response = await axiosInstance.put<GameRulesContent>(ApiRoutes.docs.updateGameRules, { content })
    return response.data
}
