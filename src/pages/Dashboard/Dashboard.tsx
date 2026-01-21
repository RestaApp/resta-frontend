/**
 * Компонент Dashboard
 * Управляет отображением табов и контента на основе роли пользователя
 */

import { useDashboard } from './hooks/useDashboard'
import { TabContent } from './components/TabContent'
import { BottomNav } from '@/components/BottomNav'
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness'
import type { UiRole, Screen } from '@/types'

import { AppHeader } from '@/components/AppHeader'

interface DashboardProps {
    role: UiRole
    onNavigate?: (screen: Screen) => void
    currentScreen?: Screen | null
}

export const Dashboard = ({ role, onNavigate, currentScreen = null }: DashboardProps) => {
    const { activeTab, handleTabChange } = useDashboard({ role, onNavigate, currentScreen })
    const { hasIncompleteFields } = useProfileCompleteness()

    return (
        <div className="min-h-screen bg-background pb-[88px]">
            <AppHeader activeTab={activeTab} />
            <main className="mx-auto max-w-2xl">
                <TabContent activeTab={activeTab} role={role} />
            </main>
            <BottomNav
                activeTab={activeTab}
                onTabChange={handleTabChange}
                role={role}
                hasIncompleteProfile={hasIncompleteFields}
            />
        </div>
    )
}


