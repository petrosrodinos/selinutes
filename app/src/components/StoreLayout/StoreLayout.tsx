import type { ReactNode } from 'react'
import { Navigation } from '../../pages/Home/components/Navigation'

interface StoreLayoutProps {
    title: string
    description: string
    actions?: ReactNode
    tabs?: ReactNode
    children: ReactNode
}

export const StoreLayout = ({ title, description, actions, tabs, children }: StoreLayoutProps) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 text-stone-100">
            <Navigation />
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-amber-400">{title}</h1>
                        <p className="text-sm text-stone-400">{description}</p>
                    </div>
                    {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
                </div>

                {tabs}

                {children}
            </div>
        </div>
    )
}
