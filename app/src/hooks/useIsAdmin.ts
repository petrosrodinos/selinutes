import { useAuthStore } from "../store/authStore";

/** True when the current user has ADMIN or SUPER_ADMIN role. */
export function useIsAdmin(): boolean {
  const role = useAuthStore((s) => s.user?.role);
  return role === "ADMIN" || role === "SUPER_ADMIN";
}
