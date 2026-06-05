import { useAdminUsersOverview } from '../../../../features/stats/hooks/use-stats'

export const UsersStatsCards = () => {
    const { data: users, isLoading, isError } = useAdminUsersOverview()
    const usersList = users ?? []

    const totalUsers = usersList.length
    const totalOnlineGamesByUsers = usersList.reduce((sum, user) => sum + user.online_games_played, 0)
    const totalUniqueOnlineGames = Math.floor(totalOnlineGamesByUsers / 2)
    const totalNonOnlineGames = usersList.reduce((sum, user) => sum + user.non_online_games_played, 0)
    const totalGames = totalUniqueOnlineGames + totalNonOnlineGames
    const totalPoints = usersList.reduce((sum, user) => sum + user.points, 0)
    const totalWins = usersList.reduce((sum, user) => sum + user.wins, 0)
    const totalLosses = usersList.reduce((sum, user) => sum + user.losses, 0)
    const totalDraws = usersList.reduce((sum, user) => sum + user.draws, 0)
    const averageGamesPerUser = totalUsers > 0 ? (totalGames / totalUsers).toFixed(1) : '0.0'
    const averagePointsPerUser = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0

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
                Failed to load user stats.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-4">
                <p className="text-xs uppercase tracking-wider text-stone-400">Total Users</p>
                <p className="mt-2 text-2xl font-bold text-amber-300">{totalUsers}</p>
            </div>
            <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-4">
                <p className="text-xs uppercase tracking-wider text-stone-400">Games Played</p>
                <p className="mt-2 text-2xl font-bold text-stone-100">{totalGames}</p>
                <p className="mt-1 text-xs text-stone-400">
                    Online by code: {totalUniqueOnlineGames} | Offline+Single: {totalNonOnlineGames}
                </p>
                <p className="mt-1 text-xs text-stone-400">Avg/user: {averageGamesPerUser}</p>
            </div>
            <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-4">
                <p className="text-xs uppercase tracking-wider text-stone-400">Total Points</p>
                <p className="mt-2 text-2xl font-bold text-emerald-300">{totalPoints}</p>
                <p className="mt-1 text-xs text-stone-400">Avg/user: {averagePointsPerUser}</p>
            </div>
            <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-4">
                <p className="text-xs uppercase tracking-wider text-stone-400">W/L/D</p>
                <p className="mt-2 text-sm font-semibold text-stone-100">
                    <span className="text-emerald-300">{totalWins}</span>
                    {' / '}
                    <span className="text-rose-300">{totalLosses}</span>
                    {' / '}
                    <span className="text-amber-200">{totalDraws}</span>
                </p>
            </div>
        </div>
    )
}
