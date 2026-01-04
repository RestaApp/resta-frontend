/**
 * Компонент Dashboard
 * Управляет отображением табов и контента на основе роли пользователя
 */

import { useDashboard } from './hooks/useDashboard'
import { TabContent } from './components/TabContent'
import { BottomNav } from '@/components/BottomNav'
import type { UserRole, Screen } from '@/types'

import { AppHeader } from '@/components/ui/AppHeader'

interface DashboardProps {
    role: UserRole
    onNavigate?: (screen: Screen) => void
    currentScreen?: Screen | null
}

export const Dashboard = ({ role, onNavigate, currentScreen = null }: DashboardProps) => {
    const { activeTab, handleTabChange } = useDashboard({ role, onNavigate, currentScreen })

    return (
        <div className="min-h-screen bg-background">
            <AppHeader />

            <TabContent activeTab={activeTab} role={role} />
            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} role={role} />
        </div>
    )
}

