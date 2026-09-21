import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { StoreLayout } from '../../../components/StoreLayout'
import { STORE_ADMIN_TABS } from '../../../config/store/store.config'

interface StoreAdminLayoutProps {
    title: string
    description: string
    children: ReactNode
}

const getTabClassName = ({ isActive }: { isActive: boolean }): string =>
    `cursor-pointer rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
        isActive
            ? 'bg-amber-500 text-stone-900 shadow-lg shadow-amber-500/20'
            : 'text-stone-400 hover:text-stone-200'
    }`

export const StoreAdminLayout = ({ title, description, children }: StoreAdminLayoutProps) => {
    const backLink = (
        <Link
            to="/home"
            className="cursor-pointer rounded-lg bg-stone-700 px-4 py-2 font-semibold text-stone-100 transition-colors hover:bg-stone-600"
        >
            Back Home
        </Link>
    )

    const tabs = (
        <div className="inline-flex rounded-xl border border-stone-700 bg-stone-900/50 p-1">
            {STORE_ADMIN_TABS.map((tab) => (
                <NavLink key={tab.to} to={tab.to} end={tab.end} className={getTabClassName}>
                    {tab.label}
                </NavLink>
            ))}
        </div>
    )

    return (
        <StoreLayout title={title} description={description} actions={backLink} tabs={tabs}>
            {children}
        </StoreLayout>
    )
}
