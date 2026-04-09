import { X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useUpdatePassword, useUpdateUsername } from '../../../features/auth/hooks/use-auth'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    username: string | null
    email: string | null
    userId: string | null
}

type SettingsTab = 'account' | 'security'

export const SettingsModal = ({ isOpen, onClose, username, email, userId }: SettingsModalProps) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('account')
    const [isEditingAccount, setIsEditingAccount] = useState(false)
    const [accountForm, setAccountForm] = useState({
        username: username ?? '',
        email: email ?? '',
    })
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const updateUsernameMutation = useUpdateUsername()
    const updatePasswordMutation = useUpdatePassword()

    useEffect(() => {
        if (isOpen) {
            setActiveTab('account')
            setIsEditingAccount(false)
            setAccountForm({
                username: username ?? '',
                email: email ?? '',
            })
            setCurrentPassword('')
            setNewPassword('')
        }
    }, [isOpen, username, email])

    const handleAccountUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const trimmedUsername = accountForm.username.trim()

        if (!trimmedUsername || trimmedUsername === username) {
            setIsEditingAccount(false)
            return
        }

        await updateUsernameMutation.mutateAsync({ username: trimmedUsername })
        setIsEditingAccount(false)
    }

    const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!currentPassword || !newPassword) {
            return
        }

        await updatePasswordMutation.mutateAsync({
            current_password: currentPassword,
            new_password: newPassword,
        })

        setCurrentPassword('')
        setNewPassword('')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-stone-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-amber-400">Settings</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-stone-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-stone-400" />
                    </button>
                </div>
                <div className="mb-4 bg-stone-900/50 rounded-xl p-1 border border-stone-700/30 grid grid-cols-2 gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('account')}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'account'
                            ? 'bg-amber-600 text-stone-900'
                            : 'text-stone-300 hover:bg-stone-700/50'
                            }`}
                    >
                        Account Info
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('security')}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security'
                            ? 'bg-amber-600 text-stone-900'
                            : 'text-stone-300 hover:bg-stone-700/50'
                            }`}
                    >
                        Security
                    </button>
                </div>
                <div className="space-y-4">
                    {activeTab === 'account' ? (
                        <>
                            <div className="bg-stone-900/50 rounded-lg p-4 border border-stone-700/30">
                                <h4 className="text-stone-200 font-medium mb-2">Account</h4>
                                <p className="text-stone-400 text-sm mb-1">User ID: <span className="text-stone-500 text-xs">{userId?.slice(0, 8)}...</span></p>
                            </div>
                            <form onSubmit={handleAccountUpdate} className="bg-stone-900/50 rounded-lg p-4 border border-stone-700/30 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-stone-200 font-medium">Account Info</h4>
                                    {!isEditingAccount ? (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingAccount(true)}
                                            className="py-1.5 px-3 text-xs font-semibold rounded-lg bg-stone-700 text-stone-200 hover:bg-stone-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    ) : null}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-stone-400">Username</label>
                                    <input
                                        type="text"
                                        value={accountForm.username}
                                        onChange={(event) => setAccountForm((previous) => ({ ...previous, username: event.target.value }))}
                                        className="w-full rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 outline-none focus:border-amber-500 disabled:opacity-70"
                                        placeholder="Enter username"
                                        minLength={2}
                                        required
                                        disabled={!isEditingAccount}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-stone-400">Email</label>
                                    <input
                                        type="email"
                                        value={accountForm.email}
                                        className="w-full rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 outline-none disabled:opacity-70"
                                        disabled
                                    />
                                </div>
                                {isEditingAccount ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditingAccount(false)
                                                setAccountForm((previous) => ({
                                                    ...previous,
                                                    username: username ?? '',
                                                }))
                                            }}
                                            className="w-full py-2 px-4 bg-stone-700 hover:bg-stone-600 text-stone-100 font-semibold rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updateUsernameMutation.isPending || !accountForm.username.trim() || accountForm.username.trim() === username}
                                            className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-stone-900 font-semibold rounded-xl transition-colors"
                                        >
                                            {updateUsernameMutation.isPending ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                ) : null}
                            </form>
                        </>
                    ) : (
                        <form onSubmit={handlePasswordUpdate} className="bg-stone-900/50 rounded-lg p-4 border border-stone-700/30 space-y-3">
                            <h4 className="text-stone-200 font-medium">Change Password</h4>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                                className="w-full rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 outline-none focus:border-amber-500"
                                placeholder="Current password"
                                minLength={6}
                                required
                            />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                className="w-full rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-stone-100 outline-none focus:border-amber-500"
                                placeholder="New password"
                                minLength={6}
                                required
                            />
                            <button
                                type="submit"
                                disabled={updatePasswordMutation.isPending || !currentPassword || !newPassword}
                                className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-stone-900 font-semibold rounded-xl transition-colors"
                            >
                                {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
