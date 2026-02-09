import axiosInstance from '../../../config/api/axios'
import { ApiRoutes } from '../../../config/api/routes'
import type { AuthResponse, SignIn, SignUp } from '../interfaces/auth.interfaces'

export const signUp = async (data: SignUp): Promise<AuthResponse> => {
    try {
        const response = await axiosInstance.post<AuthResponse>(ApiRoutes.auth.email.register, data)
        return response.data
    } catch (error: any) {
        throw new Error(error.response.data.message || 'An error occurred while signing up');
    }
}

export const signIn = async (data: SignIn): Promise<AuthResponse> => {
    try {
        const response = await axiosInstance.post<AuthResponse>(ApiRoutes.auth.email.login, data)
        return response.data
    } catch (error: any) {
        throw new Error(error.response.data.message || 'An error occurred while signing in');
    }
}

export const refreshToken = async (): Promise<AuthResponse> => {
    try {
        const response = await axiosInstance.get<AuthResponse>(ApiRoutes.auth.email.refresh_token)
        return response.data
    } catch (error: any) {
        throw new Error(error.response.data.message || 'An error occurred while refreshing token');
    }
}