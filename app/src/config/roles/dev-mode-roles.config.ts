import { AuthRoles, type AuthRole } from '../../features/users/interfaces/users.interfaces'

export const DEV_MODE_ROLES = [
    AuthRoles.SUPPORT,
    AuthRoles.ADMIN,
    AuthRoles.SUPER_ADMIN,
] as const

export type DevModeRole = (typeof DEV_MODE_ROLES)[number]

export const canAccessDevMode = (role: AuthRole | string | undefined | null): boolean =>
    DEV_MODE_ROLES.some((allowed) => allowed === role)
