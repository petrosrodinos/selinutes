import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAdminUsersOverview, useDeleteAdminUser } from '../../features/stats/hooks/use-stats'
import { Navigation } from '../Home/components/Navigation'
import { ConfirmationDialog } from '../../components/ConfirmationDialog'

export const UsersOverview = () => {
    const { data: users, isLoading, isError, refetch, isRefetching } = useAdminUsersOverview()
    const deleteUserMutation = useDeleteAdminUser()
    const [selectedUser, setSelectedUser] = useState<{ uuid: string; username: string } | null>(null)
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

    const handleDeleteUser = async () => {
        if (!selectedUser) return

        await deleteUserMutation.mutateAsync(selectedUser.uuid)
        setSelectedUser(null)
        await refetch()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 text-stone-100">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-amber-400">Admin Users</h1>
                        <p className="text-stone-400 text-sm">Users, account info, and gameplay stats overview.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="py-2 px-4 bg-amber-600 hover:bg-amber-500 text-stone-900 rounded-lg font-semibold transition-colors disabled:opacity-70"
                            disabled={isRefetching}
                        >
                            {isRefetching ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <Link
                            to="/home"
                            className="py-2 px-4 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg font-semibold transition-colors"
                        >
                            Back Home
                        </Link>
                    </div>
                </div>

                {isLoading ? (
                    <div className="bg-stone-800/70 border border-stone-700 rounded-xl p-6 text-stone-300">
                        Loading users overview...
                    </div>
                ) : null}

                {isError ? (
                    <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-red-200">
                        Failed to load users overview.
                    </div>
                ) : null}

                {!isLoading && !isError ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                ) : null}

                {!isLoading && !isError ? (
                    <div className="bg-stone-800/70 border border-stone-700 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1120px]">
                                <thead className="bg-stone-900/60">
                                    <tr className="text-left text-xs uppercase tracking-wider text-stone-400">
                                        <th className="px-4 py-3">Username</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Games Played</th>
                                        <th className="px-4 py-3">Points</th>
                                        <th className="px-4 py-3">Level</th>
                                        <th className="px-4 py-3">Rank</th>
                                        <th className="px-4 py-3">W</th>
                                        <th className="px-4 py-3">L</th>
                                        <th className="px-4 py-3">D</th>
                                        <th className="px-4 py-3">User UUID</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.map((user) => (
                                        <tr key={user.user_uuid} className="border-t border-stone-700/60 text-sm">
                                            <td className="px-4 py-3 text-amber-300 font-medium">{user.username}</td>
                                            <td className="px-4 py-3 text-stone-300">{user.email}</td>
                                            <td className="px-4 py-3 text-stone-300">{user.role}</td>
                                            <td className="px-4 py-3 text-stone-200">{user.games_played}</td>
                                            <td className="px-4 py-3 text-stone-200">{user.points}</td>
                                            <td className="px-4 py-3 text-stone-200">{user.level}</td>
                                            <td className="px-4 py-3 text-stone-200">{user.rank}</td>
                                            <td className="px-4 py-3 text-emerald-300">{user.wins}</td>
                                            <td className="px-4 py-3 text-red-300">{user.losses}</td>
                                            <td className="px-4 py-3 text-amber-200">{user.draws}</td>
                                            <td className="px-4 py-3 text-xs text-stone-500">{user.user_uuid}</td>
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedUser({ uuid: user.user_uuid, username: user.username })}
                                                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-rose-700 hover:bg-rose-600 text-white transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : null}
            </div>
            <ConfirmationDialog
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message={`Are you sure you want to delete ${selectedUser?.username ?? 'this user'}? This action cannot be undone.`}
                confirmText={deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
                cancelText="Cancel"
                isConfirming={deleteUserMutation.isPending}
            />
        </div>
    )
}
