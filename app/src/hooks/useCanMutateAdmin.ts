import { useAuthStore } from '../store/authStore'
import { canMutateAdmin } from '../config/roles/admin-access-roles.config'

export function useCanMutateAdmin(): boolean {
    const role = useAuthStore((s) => s.user?.role)
    return canMutateAdmin(role)
}
