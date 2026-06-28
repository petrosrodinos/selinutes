import { useEffect, useRef, useState } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

interface UserActionsMenuProps {
    onEdit: () => void
    onDelete: () => void
}

export const UserActionsMenu = ({ onEdit, onDelete }: UserActionsMenuProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const handleEdit = () => {
        setIsOpen(false)
        onEdit()
    }

    const handleDelete = () => {
        setIsOpen(false)
        onDelete()
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="rounded-lg border border-stone-700 bg-stone-900/60 p-1.5 text-stone-400 transition-colors hover:border-stone-600 hover:text-amber-300"
                aria-label="User actions"
                aria-expanded={isOpen}
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen ? (
                <div className="absolute right-0 z-20 mt-1 min-w-[9rem] overflow-hidden rounded-lg border border-stone-700 bg-stone-900 shadow-xl">
                    <button
                        type="button"
                        onClick={handleEdit}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-200 transition-colors hover:bg-stone-800"
                    >
                        <Pencil className="h-3.5 w-3.5 text-amber-400" />
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-300 transition-colors hover:bg-rose-950/40"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </button>
                </div>
            ) : null}
        </div>
    )
}
