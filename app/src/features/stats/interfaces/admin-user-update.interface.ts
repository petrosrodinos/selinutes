import type { AuthRole } from '../../users/interfaces/users.interfaces'

export interface UpdateAdminUserPayload {
    username: string
    email: string
    role: AuthRole
    points: number
    level: number
    wins: number
    losses: number
    draws: number
}
