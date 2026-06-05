import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from './components/AdminLayout'
import { AdminTabs } from './components/AdminTabs'
import { UsersTab } from './components/UsersTab/UsersTab'
import { UsersStatsCards } from './components/UsersTab/UsersStatsCards'
import { GamesTab } from './components/GamesTab/GamesTab'
import { GamesStatsCards } from './components/GamesTab/GamesStatsCards'
import { ADMIN_TABS, type AdminTab } from './config/admin-tabs.config'

export const AdminPage = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>(ADMIN_TABS.USERS)
    const [gamesPage, setGamesPage] = useState(1)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const queryClient = useQueryClient()

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['stats', 'admin-users-overview'] }),
            queryClient.invalidateQueries({ queryKey: ['stats', 'admin-games-overview'] }),
        ])
        setIsRefreshing(false)
    }

    const handleTabChange = (tab: AdminTab) => {
        setActiveTab(tab)
    }

    const stats = activeTab === ADMIN_TABS.USERS
        ? <UsersStatsCards />
        : <GamesStatsCards page={gamesPage} />

    return (
        <AdminLayout
            title="Admin Dashboard"
            description="Manage users and review all game sessions across the platform."
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            stats={stats}
            tabs={<AdminTabs activeTab={activeTab} onTabChange={handleTabChange} />}
        >
            {activeTab === ADMIN_TABS.USERS ? (
                <UsersTab />
            ) : (
                <GamesTab page={gamesPage} onPageChange={setGamesPage} />
            )}
        </AdminLayout>
    )
}
