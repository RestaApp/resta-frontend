import { useDashboard } from '@/pages/Dashboard/hooks/useDashboard'
import { TabContent } from '@/components/TabContent'
import { BottomNav } from '@/components/BottomNav'
import { useProfileCompleteness } from '@/features/profile/model/utils/profileCompleteness'
import type { UiRole, Screen } from '@/types'
import { AppHeader } from '@/components/AppHeader'

const BOTTOM_NAV_HEIGHT_PX = 88

interface DashboardProps {
    role: UiRole
    onNavigate: (screen: Screen) => void
    currentScreen: Screen
}

export const Dashboard = ({ role, onNavigate, currentScreen }: DashboardProps) => {
    const { activeTab, handleTabChange } = useDashboard({ role, onNavigate, currentScreen })
    const profileCompleteness = useProfileCompleteness()
    const hasIncompleteFields = !(profileCompleteness?.isFilled)

    return (
        <div className="min-h-screen bg-background" style={{ paddingBottom: BOTTOM_NAV_HEIGHT_PX }}>
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