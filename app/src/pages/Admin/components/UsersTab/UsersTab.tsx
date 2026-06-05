import { useState } from 'react'
import { useAdminUsersOverview, useDeleteAdminUser } from '../../../../features/stats/hooks/use-stats'
import { ConfirmationDialog } from '../../../../components/ConfirmationDialog'

export const UsersTab = () => {
    const { data: users, isLoading, isError, refetch } = useAdminUsersOverview()
    const deleteUserMutation = useDeleteAdminUser()
    const [selectedUser, setSelectedUser] = useState<{ uuid: string; username: string } | null>(null)
    const usersList = users ?? []

    const handleDeleteUser = async () => {
        if (!selectedUser) return

        await deleteUserMutation.mutateAsync(selectedUser.uuid)
        setSelectedUser(null)
        await refetch()
    }

    if (isLoading) {
        return (
            <div className="rounded-xl border border-stone-700 bg-stone-800/70 p-6 text-stone-300">
                Loading users...
            </div>
        )
    }

    if (isError) {
        return (
            <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-6 text-red-200">
                Failed to load users overview.
            </div>
        )
    }

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-stone-700 bg-stone-800/70">
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
                            {usersList.map((user) => (
                                <tr key={user.user_uuid} className="border-t border-stone-700/60 text-sm">
                                    <td className="px-4 py-3 font-medium text-amber-300">{user.username}</td>
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
                                            className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-600"
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
        </>
    )
}
