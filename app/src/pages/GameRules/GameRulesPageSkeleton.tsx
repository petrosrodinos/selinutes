import { Navbar } from '../../components/Navbar'

const SkeletonBlock = ({ className }: { className: string }) => (
    <div className={`animate-pulse rounded-xl bg-stone-800/80 border border-stone-700/50 ${className}`} />
)

export const GameRulesPageSkeleton = () => {
    return (
        <div className="min-h-screen bg-stone-950 text-stone-100">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(180,83,9,0.08),transparent)] pointer-events-none" />

            <Navbar showBackButton />

            <main className="relative z-10 w-full px-3 py-4 pb-6 sm:px-4 space-y-4">
                <SkeletonBlock className="h-10 w-72" />
                <SkeletonBlock className="h-5 w-48" />
                <SkeletonBlock className="min-h-[calc(100vh-120px)] w-full" />
            </main>
        </div>
    )
}
