import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface AdminGuardProps {
    children: ReactNode
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
    const userId = useAuthStore((state) => state.userId)
    const role = useAuthStore((state) => state.user?.role)

    if (!userId) {
        return <Navigate to="/login" replace />
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(role ?? '')) {
        return <Navigate to="/home" replace />
    }

    return <>{children}</>
}
