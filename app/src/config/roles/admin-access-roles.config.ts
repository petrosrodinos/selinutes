import { AuthRoles, type AuthRole } from '../../features/users/interfaces/users.interfaces'

export const ADMIN_PAGE_ACCESS_ROLES = [
    AuthRoles.SUPPORT,
    AuthRoles.ADMIN,
    AuthRoles.SUPER_ADMIN,
] as const

export const ADMIN_MUTATE_ROLES = [
    AuthRoles.ADMIN,
    AuthRoles.SUPER_ADMIN,
] as const

export type AdminPageAccessRole = (typeof ADMIN_PAGE_ACCESS_ROLES)[number]
export type AdminMutateRole = (typeof ADMIN_MUTATE_ROLES)[number]

export const canAccessAdminPage = (role: AuthRole | string | undefined | null): boolean =>
    ADMIN_PAGE_ACCESS_ROLES.some((allowed) => allowed === role)

export const canMutateAdmin = (role: AuthRole | string | undefined | null): boolean =>
    ADMIN_MUTATE_ROLES.some((allowed) => allowed === role)
