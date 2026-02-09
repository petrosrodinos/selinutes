export interface User {
    uuid: string;
    username: string;
    email: string;
    date_of_birth: string;
    role: AuthRole;
    created_at: string;
    updated_at: string;
    stats: UserStats;
}

export interface UserStats {
    uuid: string;
    user_uuid: string;
    rank: number;
    level: number;
    points: number;
    wins: number;
    losses: number;
    draws: number;
    created_at: string;
    updated_at: string;
}

export const AuthRoles = {
    USER: 'USER',
    ADMIN: 'ADMIN',
} as const;

export type AuthRole = (typeof AuthRoles)[keyof typeof AuthRoles];