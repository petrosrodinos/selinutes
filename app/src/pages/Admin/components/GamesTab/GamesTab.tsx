import { useState } from 'react'
import { ChevronLeft, ChevronRight, Gamepad2 } from 'lucide-react'
import { useAdminGamesOverview, useDeleteAdminGame } from '../../../../features/stats/hooks/use-stats'
import { ConfirmationDialog } from '../../../../components/ConfirmationDialog'
import { ADMIN_GAMES_PAGE_LIMIT } from '../../config/admin-tabs.config'
import type { AdminGameSessionEntry } from '../../../../features/stats/interfaces/stats.interface'
import { GameSessionCard } from './GameSessionCard'

interface GamesTabProps {
    page: number
    onPageChange: (page: number) => void
}

const SkeletonCard = () => (
    <div className="animate-pulse rounded-2xl border border-stone-700/60 bg-stone-800/70 p-5">
        <div className="mb-4 flex justify-between">
            <div className="h-4 w-24 rounded bg-stone-700" />
            <div className="h-3 w-32 rounded bg-stone-700" />
        </div>
        <div className="space-y-2">
            <div className="h-10 rounded-xl bg-stone-700/60" />
            <div className="h-10 rounded-xl bg-stone-700/60" />
        </div>
    </div>
)

export const GamesTab = ({ page, onPageChange }: GamesTabProps) => {
    const { data, isLoading, isError } = useAdminGamesOverview({ page, limit: ADMIN_GAMES_PAGE_LIMIT })
    const deleteGameMutation = useDeleteAdminGame()
    const [selectedSession, setSelectedSession] = useState<AdminGameSessionEntry | null>(null)

    const sessions = data?.data ?? []
    const total = data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / ADMIN_GAMES_PAGE_LIMIT))

    const handleDeleteGame = async () => {
        if (!selectedSession) return

        await deleteGameMutation.mutateAsync(selectedSession.id)
        setSelectedSession(null)

        if (sessions.length === 1 && page > 1) {
            onPageChange(page - 1)
        }
    }

    const deleteMessage = selectedSession
        ? selectedSession.code
            ? `Are you sure you want to delete game ${selectedSession.code}? Both player records will be removed and their stats will be adjusted.`
            : `Are you sure you want to delete this ${selectedSession.mode.toLowerCase()} game session? The player's stats will be adjusted.`
        : ''

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        )
    }

    if (isError) {
        return (
            <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-6 text-red-200">
                Failed to load games overview.
            </div>
        )
    }

    return (
        <>
            <div className="space-y-6">
                {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-700 bg-stone-800/40 py-16">
                        <Gamepad2 className="mb-3 h-10 w-10 text-stone-600" />
                        <p className="text-stone-400">No games have been played yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {sessions.map((session) => (
                            <GameSessionCard
                                key={session.id}
                                session={session}
                                onDelete={() => setSelectedSession(session)}
                            />
                        ))}
                    </div>
                )}

                {totalPages > 1 ? (
                    <div className="flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                            className="rounded-lg border border-stone-700 bg-stone-800/70 p-2 text-stone-400 transition-colors hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-sm text-stone-400">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages}
                            className="rounded-lg border border-stone-700 bg-stone-800/70 p-2 text-stone-400 transition-colors hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                ) : null}
            </div>

            <ConfirmationDialog
                isOpen={!!selectedSession}
                onClose={() => setSelectedSession(null)}
                onConfirm={handleDeleteGame}
                title="Delete Game"
                message={deleteMessage}
                confirmText={deleteGameMutation.isPending ? 'Deleting...' : 'Delete'}
                cancelText="Cancel"
                isConfirming={deleteGameMutation.isPending}
            />
        </>
    )
}
