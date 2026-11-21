const BLOCK = 'animate-pulse rounded bg-stone-700/60'

const OrderCardSkeleton = () => (
    <div className="space-y-4 rounded-xl border border-stone-700 bg-stone-800/70 p-5" aria-hidden="true">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
                <div className={`h-14 w-14 shrink-0 rounded-lg ${BLOCK}`} />
                <div className="space-y-2">
                    <div className={`h-5 w-44 ${BLOCK}`} />
                    <div className={`h-3 w-60 max-w-full ${BLOCK}`} />
                </div>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
                <div className={`h-5 w-16 ${BLOCK}`} />
                <div className={`h-9 w-44 rounded-lg ${BLOCK}`} />
            </div>
        </div>
    </div>
)

export const OrdersSkeleton = () => (
    <div className="space-y-4" role="status" aria-label="Loading orders">
        {Array.from({ length: 3 }, (_, index) => (
            <OrderCardSkeleton key={index} />
        ))}
    </div>
)
