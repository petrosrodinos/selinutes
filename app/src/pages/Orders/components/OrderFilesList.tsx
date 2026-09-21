import { Download, FileText } from 'lucide-react'
import type { ProductFile } from '../../../features/store/interfaces/store.interface'
import { formatFileSize } from '../../../utils/store.utils'

interface OrderFilesListProps {
    files: ProductFile[]
    downloadingFileUuid: string | null
    onDownload: (fileUuid: string) => void
}

interface OrderFileRowProps {
    file: ProductFile
    isDownloading: boolean
    onDownload: (fileUuid: string) => void
}

const OrderFileRow = ({ file, isDownloading, onDownload }: OrderFileRowProps) => {
    const handleClick = () => {
        onDownload(file.uuid)
    }

    return (
        <li className="flex items-center gap-3 rounded-lg border border-stone-700/60 bg-stone-900/40 px-3 py-2">
            <FileText className="h-4 w-4 shrink-0 text-stone-500" />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-stone-200">{file.name}</p>
                <p className="text-xs text-stone-500">{formatFileSize(file.size)}</p>
            </div>
            <button
                type="button"
                onClick={handleClick}
                disabled={isDownloading}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Download className="h-3.5 w-3.5" />
                {isDownloading ? 'Preparing...' : 'Download'}
            </button>
        </li>
    )
}

export const OrderFilesList = ({ files, downloadingFileUuid, onDownload }: OrderFilesListProps) => {
    return (
        <ul className="space-y-2">
            {files.map((file) => (
                <OrderFileRow
                    key={file.uuid}
                    file={file}
                    isDownloading={downloadingFileUuid === file.uuid}
                    onDownload={onDownload}
                />
            ))}
        </ul>
    )
}
