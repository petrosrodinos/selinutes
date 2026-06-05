import { useCallback } from 'react'
import { Pencil, Save, X } from 'lucide-react'
import { Navbar } from '../../components/Navbar'
import { PoweredByFooter } from '../../components/PoweredByFooter'
import { ConfirmationDialog } from '../../components/ConfirmationDialog'
import { useIsAdmin } from '../../hooks/useIsAdmin'
import { useGameRules, useUpdateGameRules } from '../../features/docs'
import { useGameRulesEditor } from './hooks/useGameRulesEditor'
import { GameRulesMarkdown } from './components/GameRulesMarkdown'
import { GameRulesMarkdownEditor } from './components/GameRulesMarkdownEditor'
import { GameRulesPageSkeleton } from './GameRulesPageSkeleton'

const formatUpdatedAt = (value: string): string => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleString()
}

export const GameRulesPage = () => {
    const isAdmin = useIsAdmin()
    const { data, isLoading, isError, refetch } = useGameRules()
    const updateMutation = useUpdateGameRules()

    const handleSave = useCallback(
        async (content: string) => {
            await updateMutation.mutateAsync(content)
        },
        [updateMutation],
    )

    const editor = useGameRulesEditor({
        content: data?.content ?? '',
        onSave: handleSave,
    })

    const saveDialogOpen = editor.pendingAction === 'save'
    const cancelDialogOpen = editor.pendingAction === 'cancel'
    const isConfirming = editor.isSaving || updateMutation.isPending

    if (isLoading) {
        return <GameRulesPageSkeleton />
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen bg-stone-950 text-stone-100">
                <Navbar showBackButton />
                <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
                    <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-6 text-red-200">
                        Failed to load game rules.
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="ml-3 underline hover:text-red-100"
                        >
                            Retry
                        </button>
                    </div>
                </main>
            </div>
        )
    }

    const updatedLabel = formatUpdatedAt(data.updatedAt)

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(180,83,9,0.08),transparent)] pointer-events-none" />

            <Navbar showBackButton />

            <main
                className={
                    editor.isEditing
                        ? 'relative z-10 w-full px-3 py-4 pb-6 sm:px-4'
                        : 'relative z-10 mx-auto max-w-4xl px-6 py-10 pb-20'
                }
            >
                <div
                    className={
                        editor.isEditing
                            ? 'mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
                            : 'mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'
                    }
                >
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-amber-100/95 mb-2">Game rules documentation</h1>
                        <p className="text-stone-400">
                            Canonical rules reference
                            {updatedLabel ? ` · Last updated ${updatedLabel}` : ''}
                        </p>
                    </div>

                    {isAdmin && !editor.isEditing && (
                        <button
                            type="button"
                            onClick={editor.startEditing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/15 px-4 py-2.5 text-sm font-semibold text-amber-400 transition-colors hover:border-amber-500/50 hover:bg-amber-500/25"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit
                        </button>
                    )}

                    {isAdmin && editor.isEditing && (
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={editor.requestCancel}
                                disabled={isConfirming}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-600 bg-stone-800 px-4 py-2.5 text-sm font-semibold text-stone-200 transition-colors hover:bg-stone-700 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={editor.requestSave}
                                disabled={isConfirming}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-600/20 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <Save className="h-4 w-4" />
                                Save
                            </button>
                        </div>
                    )}
                </div>

                {editor.isEditing ? (
                    <GameRulesMarkdownEditor
                        value={editor.draftContent}
                        onChange={editor.setDraftContent}
                    />
                ) : (
                    <GameRulesMarkdown content={data.content} />
                )}
            </main>

            <PoweredByFooter />

            <ConfirmationDialog
                isOpen={saveDialogOpen}
                onClose={editor.dismissDialog}
                onConfirm={editor.confirmPendingAction}
                title="Save changes?"
                message="This will overwrite the canonical game rules document for all readers."
                confirmText="Save"
                cancelText="Keep editing"
                isConfirming={isConfirming}
            />

            <ConfirmationDialog
                isOpen={cancelDialogOpen}
                onClose={editor.dismissDialog}
                onConfirm={editor.confirmPendingAction}
                title="Discard changes?"
                message="You have unsaved edits. Discard them and return to the published version?"
                confirmText="Discard"
                cancelText="Keep editing"
                isConfirming={isConfirming}
            />
        </div>
    )
}
