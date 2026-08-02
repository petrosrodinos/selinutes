import { useAuthStore } from '../store/authStore'
import { canAccessAdminPage } from '../config/roles/admin-access-roles.config'

export function useCanAccessAdmin(): boolean {
    const role = useAuthStore((s) => s.user?.role)
    return canAccessAdminPage(role)
}
