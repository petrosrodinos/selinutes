import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, LogOut, Settings, Shield, User } from 'lucide-react'
import { useCanAccessAdmin, useIsAdmin } from '../../hooks'

interface UserMenuProps {
    onOpenSettings: () => void
    onLogout: () => void
}

export const UserMenu = ({ onOpenSettings, onLogout }: UserMenuProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const canAccessAdmin = useCanAccessAdmin()
    const isAdmin = useIsAdmin()

    const handleClose = useCallback(() => {
        setIsOpen(false)
    }, [])

    const handleToggle = useCallback(() => {
        setIsOpen((previous) => !previous)
    }, [])

    const handleSettings = useCallback(() => {
        setIsOpen(false)
        onOpenSettings()
    }, [onOpenSettings])

    const handleLogout = useCallback(() => {
        setIsOpen(false)
        onLogout()
    }, [onLogout])

    useEffect(() => {
        if (!isOpen) return

        const handlePointerDown = (event: PointerEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('pointerdown', handlePointerDown)
        return () => document.removeEventListener('pointerdown', handlePointerDown)
    }, [isOpen])

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={handleToggle}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label="User menu"
                className="cursor-pointer rounded-lg border border-stone-600/50 bg-stone-700/60 p-2 transition-all duration-200 hover:bg-stone-600/60 sm:p-2.5"
            >
                <User className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
            </button>
            {isOpen ? (
                <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-stone-700 bg-stone-800 py-1 shadow-2xl"
                >
                    {canAccessAdmin || isAdmin ? (
                        <div className="mb-1 border-b border-stone-700 pb-1">
                            {canAccessAdmin ? (
                                <Link
                                    to="/admin"
                                    role="menuitem"
                                    onClick={handleClose}
                                    className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-amber-300 transition-colors hover:bg-stone-700"
                                >
                                    <Shield className="h-4 w-4" />
                                    Admin
                                </Link>
                            ) : null}
                            {isAdmin ? (
                                <Link
                                    to="/game-rules"
                                    role="menuitem"
                                    onClick={handleClose}
                                    className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-amber-300 transition-colors hover:bg-stone-700"
                                >
                                    <FileText className="h-4 w-4" />
                                    Admin docs
                                </Link>
                            ) : null}
                        </div>
                    ) : null}
                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleSettings}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-stone-200 transition-colors hover:bg-stone-700"
                    >
                        <Settings className="h-4 w-4 text-amber-400" />
                        Settings
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-950/40 hover:text-red-300"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </button>
                </div>
            ) : null}
        </div>
    )
}
