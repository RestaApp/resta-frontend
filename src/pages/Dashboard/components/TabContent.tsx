import { FeedPage } from "@/pages/Feed/FeedPage"
import { ActivityPage } from "@/pages/Activity/ActivityPage"
import type { Tab, UiRole } from "@/types"

interface TabContentProps {
    activeTab: Tab
    role: UiRole
}

export const TabContent = ({ activeTab, role }: TabContentProps) => {
    // Для таба feed показываем FeedPage
    if (activeTab === 'feed') {
        return <FeedPage />
    }

    if (activeTab === 'activity') {
        return <ActivityPage />
    }

    // Для остальных табов показываем заглушку
    return (
        <div className="min-h-screen pb-20 bg-background">
            <div className="p-4 max-w-md mx-auto">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Таб: {activeTab}</h3>
                    <p className="text-sm text-muted-foreground">Роль: {role}</p>
                </div>
                <p className="text-muted-foreground">Контент для этого таба будет добавлен позже</p>
            </div>
        </div>
    )
}
