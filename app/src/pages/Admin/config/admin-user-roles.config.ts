import { AuthRoles, type AuthRole } from '../../../features/users/interfaces/users.interfaces'

export const ADMIN_USER_ROLE_OPTIONS = [
    { value: AuthRoles.USER, label: 'User' },
    { value: AuthRoles.SUPPORT, label: 'Support' },
    { value: AuthRoles.ADMIN, label: 'Admin' },
    { value: AuthRoles.SUPER_ADMIN, label: 'Super Admin' },
] as const

export type AdminUserRoleOption = (typeof ADMIN_USER_ROLE_OPTIONS)[number]['value']

export const isAuthRole = (value: string): value is AuthRole =>
    ADMIN_USER_ROLE_OPTIONS.some((option) => option.value === value)
