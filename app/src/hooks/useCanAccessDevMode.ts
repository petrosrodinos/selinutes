import { useAuthStore } from '../store/authStore'
import { canAccessDevMode } from '../config/roles/dev-mode-roles.config'

export function useCanAccessDevMode(): boolean {
    const role = useAuthStore((s) => s.user?.role)
    return canAccessDevMode(role)
}
