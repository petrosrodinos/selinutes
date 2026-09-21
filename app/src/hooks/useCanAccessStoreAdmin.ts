import { useAuthStore } from '../store/authStore'
import { canAccessStoreAdmin } from '../config/roles/admin-access-roles.config'

export function useCanAccessStoreAdmin(): boolean {
    const role = useAuthStore((s) => s.user?.role)
    return canAccessStoreAdmin(role)
}
