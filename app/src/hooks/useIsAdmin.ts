import { useAuthStore } from "../store/authStore";
import { isAdminRole } from "../config/roles/admin-access-roles.config";

export function useIsAdmin(): boolean {
  const role = useAuthStore((s) => s.user?.role);
  return isAdminRole(role);
}
