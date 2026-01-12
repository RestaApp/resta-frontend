import { FeedPage } from '@/pages/Feed/FeedPage'
import { ActivityPage } from '@/pages/Activity/ActivityPage'
import type { Tab, UiRole } from '@/types'

const TAB_COMPONENTS: Partial<Record<Tab, React.ComponentType>> = {
    feed: FeedPage,
    activity: ActivityPage,
}

export const TabContent = ({ activeTab, role }: { activeTab: Tab; role: UiRole }) => {
    const Component = TAB_COMPONENTS[activeTab]

    if (Component) return <Component />

    return (
        <div className="p-4">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Таб: {activeTab}</h3>
                <p className="text-sm text-muted-foreground">Роль: {role}</p>
            </div>
            <p className="text-muted-foreground">Контент для этого таба будет добавлен позже</p>
        </div>
    )
}
