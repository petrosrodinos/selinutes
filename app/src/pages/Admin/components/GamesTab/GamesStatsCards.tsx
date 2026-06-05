import { useAdminGamesOverview } from '../../../../features/stats/hooks/use-stats'
import { ADMIN_GAMES_PAGE_LIMIT } from '../../config/admin-tabs.config'

interface GamesStatsCardsProps {
    page: number
}

export const GamesStatsCards = ({ page }: GamesStatsCardsProps) => {
    const { data, isLoading, isError } = useAdminGamesOverview({ page, limit: ADMIN_GAMES_PAGE_LIMIT })

    const sessions = data?.data ?? []
    const total = data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / ADMIN_GAMES_PAGE_LIMIT))
    const onlineCount = sessions.filter((s) => s.mode === 'ONLINE').length
    const offlineCount = sessions.filter((s) => s.mode === 'OFFLINE').length
    const singleCount = sessions.filter((s) => s.mode === 'SINGLE').length
    const uniquePlayers = new Set(sessions.flatMap((s) => s.players.map((p) => p.user_uuid))).size

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-xl border border-stone-700 bg-stone-800/70" />
                ))}
            </div>
        )
    }

    if (isError) {
        return (
            <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-4 text-red-200">
                Failed to load game stats.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-4">
                <p className="text-xs uppercase tracking-wider text-stone-400">Total Sessions</p>
                <p className="mt-2 text-2xl font-bold text-amber-300">{total}</p>
                <p className="mt-1 text-xs text-stone-400">Grouped by game code</p>
            </div>
            <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-4">
                <p className="text-xs uppercase tracking-wider text-stone-400">This Page</p>
                <p className="mt-2 text-2xl font-bold text-stone-100">{sessions.length}</p>
                <p className="mt-1 text-xs text-stone-400">
                    Online {onlineCount} · Local {offlineCount} · Single {singleCount}
                </p>
            </div>
            <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-4">
                <p className="text-xs uppercase tracking-wider text-stone-400">Players (page)</p>
                <p className="mt-2 text-2xl font-bold text-emerald-300">{uniquePlayers}</p>
            </div>
            <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-4">
                <p className="text-xs uppercase tracking-wider text-stone-400">Page</p>
                <p className="mt-2 text-2xl font-bold text-stone-100">
                    {page} <span className="text-lg text-stone-500">/ {totalPages}</span>
                </p>
            </div>
        </div>
    )
}
