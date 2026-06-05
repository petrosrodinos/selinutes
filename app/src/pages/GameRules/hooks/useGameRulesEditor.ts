import { useCallback, useMemo, useState } from 'react'

type PendingAction = 'save' | 'cancel' | null

type UseGameRulesEditorParams = {
    content: string
    onSave: (content: string) => Promise<void>
}

export type UseGameRulesEditorReturn = {
    isEditing: boolean
    draftContent: string
    hasChanges: boolean
    pendingAction: PendingAction
    startEditing: () => void
    setDraftContent: (value: string) => void
    requestSave: () => void
    requestCancel: () => void
    dismissDialog: () => void
    confirmPendingAction: () => Promise<void>
    isSaving: boolean
}

export const useGameRulesEditor = ({
    content,
    onSave,
}: UseGameRulesEditorParams): UseGameRulesEditorReturn => {
    const [isEditing, setIsEditing] = useState(false)
    const [draftContent, setDraftContent] = useState(content)
    const [pendingAction, setPendingAction] = useState<PendingAction>(null)
    const [isSaving, setIsSaving] = useState(false)

    const hasChanges = useMemo(
        () => isEditing && draftContent !== content,
        [isEditing, draftContent, content],
    )

    const startEditing = useCallback(() => {
        setDraftContent(content)
        setIsEditing(true)
        setPendingAction(null)
    }, [content])

    const requestSave = useCallback(() => {
        if (!hasChanges) {
            setIsEditing(false)
            return
        }
        setPendingAction('save')
    }, [hasChanges])

    const requestCancel = useCallback(() => {
        if (hasChanges) {
            setPendingAction('cancel')
            return
        }
        setIsEditing(false)
        setDraftContent(content)
    }, [hasChanges, content])

    const dismissDialog = useCallback(() => {
        setPendingAction(null)
    }, [])

    const confirmPendingAction = useCallback(async () => {
        if (pendingAction === 'save') {
            setIsSaving(true)
            try {
                await onSave(draftContent)
                setIsEditing(false)
                setPendingAction(null)
            } finally {
                setIsSaving(false)
            }
            return
        }

        if (pendingAction === 'cancel') {
            setIsEditing(false)
            setDraftContent(content)
            setPendingAction(null)
        }
    }, [pendingAction, onSave, draftContent, content])

    return {
        isEditing,
        draftContent,
        hasChanges,
        pendingAction,
        startEditing,
        setDraftContent,
        requestSave,
        requestCancel,
        dismissDialog,
        confirmPendingAction,
        isSaving,
    }
}
