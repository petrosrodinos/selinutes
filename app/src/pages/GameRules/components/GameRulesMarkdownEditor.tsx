import { useEffect, useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const EDITOR_VIEWPORT_OFFSET = 120

const getEditorHeight = (): number => window.innerHeight - EDITOR_VIEWPORT_OFFSET

type GameRulesMarkdownEditorProps = {
    value: string
    onChange: (value: string) => void
}

export const GameRulesMarkdownEditor = ({ value, onChange }: GameRulesMarkdownEditorProps) => {
    const [height, setHeight] = useState(getEditorHeight)

    useEffect(() => {
        const handleResize = () => {
            setHeight(getEditorHeight())
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div
            data-color-mode="dark"
            className="w-full overflow-hidden rounded-xl border border-stone-700/60 [&_.w-md-editor]:!w-full [&_.w-md-editor]:!max-w-none"
        >
            <MDEditor
                value={value}
                onChange={(nextValue) => onChange(nextValue ?? '')}
                height={height}
                preview="live"
                visibleDragbar
                className="w-full"
                style={{ width: '100%' }}
                textareaProps={{
                    placeholder: 'Write game rules in markdown...',
                }}
            />
        </div>
    )
}
