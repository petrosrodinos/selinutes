import { ADMIN_TAB_OPTIONS, type AdminTab } from '../config/admin-tabs.config'

interface AdminTabsProps {
    activeTab: AdminTab
    onTabChange: (tab: AdminTab) => void
}

export const AdminTabs = ({ activeTab, onTabChange }: AdminTabsProps) => {
    return (
        <div className="inline-flex rounded-xl border border-stone-700 bg-stone-900/50 p-1">
            {ADMIN_TAB_OPTIONS.map((tab) => {
                const isActive = activeTab === tab.value

                return (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => onTabChange(tab.value)}
                        className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                            isActive
                                ? 'bg-amber-500 text-stone-900 shadow-lg shadow-amber-500/20'
                                : 'text-stone-400 hover:text-stone-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}
