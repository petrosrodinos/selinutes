const BLOCK = 'animate-pulse rounded bg-stone-700/60'

export const ProductCardSkeleton = () => (
    <div className="flex flex-col gap-4 overflow-hidden rounded-xl border border-stone-700 bg-stone-800/70 pb-5" aria-hidden="true">
        <div className={`aspect-video w-full ${BLOCK} rounded-none`} />
        <div className={`mx-5 h-5 w-2/3 ${BLOCK}`} />
        <div className="mx-5 space-y-2">
            <div className={`h-3 w-full ${BLOCK}`} />
            <div className={`h-3 w-5/6 ${BLOCK}`} />
        </div>
        <div className="mx-5 space-y-3 border-t border-stone-700/60 pt-4">
            <div className={`h-6 w-24 ${BLOCK}`} />
            <div className={`h-10 w-full rounded-lg ${BLOCK}`} />
        </div>
    </div>
)

export const ProductGridSkeleton = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading products">
        {Array.from({ length: 6 }, (_, index) => (
            <ProductCardSkeleton key={index} />
        ))}
    </div>
)

export const ProductPageSkeleton = () => (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]" role="status" aria-label="Loading product">
        <div className="space-y-6">
            <div className={`aspect-[4/3] w-full rounded-3xl ${BLOCK}`} />
            <div className="flex gap-3">
                {Array.from({ length: 3 }, (_, index) => (
                    <div key={index} className={`h-16 w-24 rounded-xl ${BLOCK}`} />
                ))}
            </div>
        </div>
        <div className="space-y-6">
            <div className={`h-12 w-32 rounded-2xl ${BLOCK}`} />
            <div className="space-y-2">
                <div className={`h-4 w-full ${BLOCK}`} />
                <div className={`h-4 w-full ${BLOCK}`} />
                <div className={`h-4 w-2/3 ${BLOCK}`} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className={`h-20 rounded-2xl ${BLOCK}`} />
                <div className={`h-20 rounded-2xl ${BLOCK}`} />
            </div>
            <div className={`h-32 rounded-2xl ${BLOCK}`} />
        </div>
    </div>
)
