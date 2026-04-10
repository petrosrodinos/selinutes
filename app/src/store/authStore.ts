import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse } from '../features/auth/interfaces/auth.interfaces'
import type { User } from '../features/users/interfaces/users.interfaces'

interface AuthState {
    userId: string | null
    user_uuid: string | null
    username: string | null
    user: User | null
    access_token: string | null
    expires_in: number | null
    setUser: (username: string) => void
    login: (payload: AuthResponse) => void
    logout: () => void
}

const generateUUID = (): string => {
    return crypto.randomUUID()
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            userId: null,
            user_uuid: null,
            username: null,
            user: null,
            access_token: null,
            expires_in: null,
            setUser: (username: string) => set({
                userId: generateUUID(),
                username
            }),
            login: (payload: AuthResponse) => set({
                userId: payload.user.uuid,
                user_uuid: payload.user.uuid,
                username: payload.user.username,
                user: payload.user,
                access_token: payload.access_token,
                expires_in: payload.expires_in,
            }),
            logout: () => set({
                userId: null,
                user_uuid: null,
                username: null,
                user: null,
                access_token: null,
                expires_in: null,
            })
        }),
        {
            name: 'auth-storage'
        }
    )
)

export const getAuthStoreState = () => useAuthStore.getState()  
