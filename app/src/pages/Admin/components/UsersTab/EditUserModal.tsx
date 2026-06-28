import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../../../../components/Modal'
import { MAX_LEVEL } from '../../../../constants/game'
import { ADMIN_USER_ROLE_OPTIONS, isAuthRole } from '../../config/admin-user-roles.config'
import type { AdminUserOverviewEntry } from '../../../../features/stats/interfaces/stats.interface'
import type { UpdateAdminUserPayload } from '../../../../features/stats/interfaces/admin-user-update.interface'

interface EditUserModalProps {
    user: AdminUserOverviewEntry | null
    isOpen: boolean
    isSaving: boolean
    onClose: () => void
    onSave: (payload: UpdateAdminUserPayload) => Promise<void>
}

const parseNonNegativeInt = (value: string): number => {
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed
}

export const EditUserModal = ({ user, isOpen, isSaving, onClose, onSave }: EditUserModalProps) => {
    const [form, setForm] = useState<UpdateAdminUserPayload>({
        username: '',
        email: '',
        role: ADMIN_USER_ROLE_OPTIONS[0].value,
        points: 0,
        level: 1,
        wins: 0,
        losses: 0,
        draws: 0,
    })

    useEffect(() => {
        if (!user || !isOpen) return

        setForm({
            username: user.username,
            email: user.email,
            role: isAuthRole(user.role) ? user.role : ADMIN_USER_ROLE_OPTIONS[0].value,
            points: user.points,
            level: user.level,
            wins: user.wins,
            losses: user.losses,
            draws: user.draws,
        })
    }, [user, isOpen])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!user) return

        await onSave({
            username: form.username.trim(),
            email: form.email.trim(),
            role: form.role,
            points: form.points,
            level: form.level,
            wins: form.wins,
            losses: form.losses,
            draws: form.draws,
        })
    }

    if (!user) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${user.username}`} size="xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <section className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Account</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-stone-400">Username</span>
                            <input
                                type="text"
                                required
                                minLength={2}
                                value={form.username}
                                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                                className="w-full rounded-lg border border-stone-700 bg-stone-900/60 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-amber-500/50"
                            />
                        </label>
                        <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-stone-400">Email</span>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                                className="w-full rounded-lg border border-stone-700 bg-stone-900/60 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-amber-500/50"
                            />
                        </label>
                        <label className="block space-y-1.5 sm:col-span-2">
                            <span className="text-xs font-medium text-stone-400">Role</span>
                            <select
                                value={form.role}
                                onChange={(event) => {
                                    const nextRole = event.target.value
                                    if (isAuthRole(nextRole)) {
                                        setForm((prev) => ({ ...prev, role: nextRole }))
                                    }
                                }}
                                className="w-full rounded-lg border border-stone-700 bg-stone-900/60 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-amber-500/50"
                            >
                                {ADMIN_USER_ROLE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Stats</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-stone-400">Points</span>
                            <input
                                type="number"
                                min={0}
                                required
                                value={form.points}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, points: parseNonNegativeInt(event.target.value) }))
                                }
                                className="w-full rounded-lg border border-stone-700 bg-stone-900/60 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-amber-500/50"
                            />
                        </label>
                        <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-stone-400">Level</span>
                            <input
                                type="number"
                                min={1}
                                max={MAX_LEVEL}
                                required
                                value={form.level}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        level: Math.min(MAX_LEVEL, Math.max(1, parseNonNegativeInt(event.target.value) || 1)),
                                    }))
                                }
                                className="w-full rounded-lg border border-stone-700 bg-stone-900/60 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-amber-500/50"
                            />
                        </label>
                        <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-stone-400">Wins</span>
                            <input
                                type="number"
                                min={0}
                                required
                                value={form.wins}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, wins: parseNonNegativeInt(event.target.value) }))
                                }
                                className="w-full rounded-lg border border-stone-700 bg-stone-900/60 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-amber-500/50"
                            />
                        </label>
                        <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-stone-400">Losses</span>
                            <input
                                type="number"
                                min={0}
                                required
                                value={form.losses}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, losses: parseNonNegativeInt(event.target.value) }))
                                }
                                className="w-full rounded-lg border border-stone-700 bg-stone-900/60 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-amber-500/50"
                            />
                        </label>
                        <label className="block space-y-1.5">
                            <span className="text-xs font-medium text-stone-400">Draws</span>
                            <input
                                type="number"
                                min={0}
                                required
                                value={form.draws}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, draws: parseNonNegativeInt(event.target.value) }))
                                }
                                className="w-full rounded-lg border border-stone-700 bg-stone-900/60 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-amber-500/50"
                            />
                        </label>
                    </div>
                    <p className="text-xs text-stone-500">
                        Rank is recalculated automatically from points when you save.
                    </p>
                </section>

                <div className="flex justify-end gap-3 border-t border-stone-700 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="rounded-lg border border-stone-700 px-4 py-2 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
