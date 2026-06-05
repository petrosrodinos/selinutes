import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { environments } from '../../config/environments'
import { useAuthStore } from '../../store/authStore'
import { useIsAdmin } from '../../hooks/useIsAdmin'

type NavbarProps = {
  showBackButton?: boolean
  showPrimaryAction?: boolean
}

export const Navbar = ({ showBackButton = false, showPrimaryAction = true }: NavbarProps) => {
  const navigate = useNavigate()
  const user_uuid = useAuthStore((state) => state.user_uuid)
  const isLoggedIn = Boolean(user_uuid)
  const isAdmin = useIsAdmin()

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const handlePrimaryAction = useCallback(() => {
    navigate(isLoggedIn ? '/home' : '/login')
  }, [isLoggedIn, navigate])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-800 bg-stone-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-amber-400/90 transition-colors hover:text-amber-400"
          >
            {environments.APP_NAME}
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            to="/rules"
            className="text-sm font-medium text-stone-400 transition-colors hover:text-stone-200"
          >
            Rules
          </Link>
          {isAdmin ? (
            <Link
              to="/game-rules"
              className="text-sm font-medium text-stone-400 transition-colors hover:text-stone-200"
            >
              Docs
            </Link>
          ) : null}
          {showPrimaryAction && (
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="rounded-lg border border-amber-500/30 bg-amber-500/15 px-5 py-2.5 text-sm font-medium text-amber-400 transition-colors hover:border-amber-500/50 hover:bg-amber-500/25"
            >
              {isLoggedIn ? 'Home' : 'Get started'}
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
