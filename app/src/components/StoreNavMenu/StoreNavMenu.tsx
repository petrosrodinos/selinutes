import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { STORE_NAV_ITEMS, STORE_ADMIN_NAV_ITEMS } from '../../config/store/store-nav.config'
import { useCanAccessStoreAdmin } from '../../hooks'

export const StoreNavMenu = () => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const canAccessStoreAdmin = useCanAccessStoreAdmin()

    const handleToggle = useCallback(() => {
        setIsOpen((previous) => !previous)
    }, [])

    const handleClose = useCallback(() => {
        setIsOpen(false)
    }, [])

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
                aria-label="Store menu"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-600/50 bg-stone-700/60 p-2 transition-all duration-200 hover:bg-stone-600/60 sm:p-2.5 sm:px-3.5"
            >
                <ShoppingBag className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
                <span className="hidden text-sm font-medium text-stone-200 sm:inline">Store</span>
            </button>
            {isOpen ? (
                <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-stone-700 bg-stone-800 py-1 shadow-2xl"
                >
                    {STORE_NAV_ITEMS.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            role="menuitem"
                            onClick={handleClose}
                            className="block cursor-pointer px-4 py-2.5 text-sm font-medium text-stone-200 transition-colors hover:bg-stone-700"
                        >
                            {item.label}
                        </Link>
                    ))}
                    {canAccessStoreAdmin ? (
                        <div className="mt-1 border-t border-stone-700 pt-1">
                            {STORE_ADMIN_NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    role="menuitem"
                                    onClick={handleClose}
                                    className="block cursor-pointer px-4 py-2.5 text-sm font-medium text-amber-300 transition-colors hover:bg-stone-700"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    )
}
