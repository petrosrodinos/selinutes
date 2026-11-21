interface TableSkeletonProps {
    columns: number
    rows?: number
    label: string
}

export const TableSkeleton = ({ columns, rows = 6, label }: TableSkeletonProps) => (
    <div className="overflow-hidden rounded-xl border border-stone-700 bg-stone-800/70" role="status" aria-label={label}>
        <div className="flex gap-4 border-b border-stone-700 bg-stone-900/50 px-4 py-3">
            {Array.from({ length: columns }, (_, index) => (
                <div key={index} className="h-3 flex-1 animate-pulse rounded bg-stone-700/70" />
            ))}
        </div>
        {Array.from({ length: rows }, (_, row) => (
            <div key={row} className="flex items-center gap-4 border-b border-stone-700/50 px-4 py-4 last:border-b-0">
                {Array.from({ length: columns }, (_, column) => (
                    <div
                        key={column}
                        className={`h-4 flex-1 animate-pulse rounded bg-stone-700/50 ${column === 0 ? 'max-w-[40%]' : ''}`}
                    />
                ))}
            </div>
        ))}
    </div>
)
