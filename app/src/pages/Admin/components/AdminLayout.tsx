import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Navigation } from '../../Home/components/Navigation'

interface AdminLayoutProps {
    title: string
    description: string
    onRefresh: () => void
    isRefreshing: boolean
    stats?: ReactNode
    tabs?: ReactNode
    children: ReactNode
}

export const AdminLayout = ({
    title,
    description,
    onRefresh,
    isRefreshing,
    stats,
    tabs,
    children,
}: AdminLayoutProps) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 text-stone-100">
            <Navigation />
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-amber-400">{title}</h1>
                        <p className="text-sm text-stone-400">{description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={onRefresh}
                            className="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-stone-900 transition-colors hover:bg-amber-500 disabled:opacity-70"
                            disabled={isRefreshing}
                        >
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <Link
                            to="/home"
                            className="rounded-lg bg-stone-700 px-4 py-2 font-semibold text-stone-100 transition-colors hover:bg-stone-600"
                        >
                            Back Home
                        </Link>
                    </div>
                </div>

                {stats}

                {tabs}

                {children}
            </div>
        </div>
    )
}
