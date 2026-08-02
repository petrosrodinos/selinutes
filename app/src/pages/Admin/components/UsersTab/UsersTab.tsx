import { useState } from 'react'
import { useAdminUsersOverview, useDeleteAdminUser, useUpdateAdminUser } from '../../../../features/stats/hooks/use-stats'
import { useCanMutateAdmin } from '../../../../hooks'
import { ConfirmationDialog } from '../../../../components/ConfirmationDialog'
import type { AdminUserOverviewEntry } from '../../../../features/stats/interfaces/stats.interface'
import type { UpdateAdminUserPayload } from '../../../../features/stats/interfaces/admin-user-update.interface'
import { UserActionsMenu } from './UserActionsMenu'
import { EditUserModal } from './EditUserModal'

const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const ROLE_BADGE_STYLES: Record<string, string> = {
    SUPER_ADMIN: 'bg-violet-500/15 text-violet-300',
    ADMIN: 'bg-amber-500/15 text-amber-300',
    SUPPORT: 'bg-sky-500/15 text-sky-300',
    USER: 'bg-stone-500/15 text-stone-400',
}

export const UsersTab = () => {
    const { data: users, isLoading, isError } = useAdminUsersOverview()
    const canMutate = useCanMutateAdmin()
    const deleteUserMutation = useDeleteAdminUser()
    const updateUserMutation = useUpdateAdminUser()
    const [userToDelete, setUserToDelete] = useState<{ uuid: string; username: string } | null>(null)
    const [userToEdit, setUserToEdit] = useState<AdminUserOverviewEntry | null>(null)
    const usersList = users ?? []

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        await deleteUserMutation.mutateAsync(userToDelete.uuid)
        setUserToDelete(null)
    }

    const handleSaveUser = async (payload: UpdateAdminUserPayload) => {
        if (!userToEdit) return

        await updateUserMutation.mutateAsync({
            userUuid: userToEdit.user_uuid,
            payload,
        })
        setUserToEdit(null)
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
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-stone-900/60">
                            <tr className="text-left text-xs uppercase tracking-wider text-stone-400">
                                <th className="px-4 py-3">Username</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Created At</th>
                                <th className="px-4 py-3">Games Played</th>
                                <th className="px-4 py-3">Points</th>
                                <th className="px-4 py-3">Level</th>
                                <th className="px-4 py-3">Rank</th>
                                <th className="px-4 py-3">W</th>
                                <th className="px-4 py-3">L</th>
                                <th className="px-4 py-3">D</th>
                                {canMutate ? <th className="px-4 py-3">Actions</th> : null}
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.map((user) => (
                                <tr key={user.user_uuid} className="border-t border-stone-700/60 text-sm">
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-amber-300">{user.username}</span>
                                                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${ROLE_BADGE_STYLES[user.role] ?? 'bg-stone-500/15 text-stone-400'}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            <p className="text-xs text-stone-500">{user.user_uuid}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-stone-300">{user.email}</td>
                                    <td className="px-4 py-3 text-stone-400">{formatDate(user.created_at)}</td>
                                    <td className="px-4 py-3 text-stone-200">{user.games_played}</td>
                                    <td className="px-4 py-3 text-stone-200">{user.points}</td>
                                    <td className="px-4 py-3 text-stone-200">{user.level}</td>
                                    <td className="px-4 py-3 text-stone-200">{user.rank}</td>
                                    <td className="px-4 py-3 text-emerald-300">{user.wins}</td>
                                    <td className="px-4 py-3 text-red-300">{user.losses}</td>
                                    <td className="px-4 py-3 text-amber-200">{user.draws}</td>
                                    {canMutate ? (
                                        <td className="px-4 py-3">
                                            <UserActionsMenu
                                                onEdit={() => setUserToEdit(user)}
                                                onDelete={() => setUserToDelete({ uuid: user.user_uuid, username: user.username })}
                                            />
                                        </td>
                                    ) : null}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {canMutate ? (
                <>
                    <EditUserModal
                        user={userToEdit}
                        isOpen={!!userToEdit}
                        isSaving={updateUserMutation.isPending}
                        onClose={() => setUserToEdit(null)}
                        onSave={handleSaveUser}
                    />

                    <ConfirmationDialog
                        isOpen={!!userToDelete}
                        onClose={() => setUserToDelete(null)}
                        onConfirm={handleDeleteUser}
                        title="Delete User"
                        message={`Are you sure you want to delete ${userToDelete?.username ?? 'this user'}? This action cannot be undone.`}
                        confirmText={deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
                        cancelText="Cancel"
                        isConfirming={deleteUserMutation.isPending}
                    />
                </>
            ) : null}
        </>
    )
}
