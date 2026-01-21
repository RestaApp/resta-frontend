import { Suspense, lazy, type ComponentType } from 'react'
import type { Tab, UiRole } from '@/types'

const FeedPage = lazy(() => import('@/features/feed/ui/FeedPage').then(m => ({ default: m.FeedPage })))
const ActivityPage = lazy(() => import('@/pages/Activity/ActivityPage').then(m => ({ default: m.ActivityPage })))
const ProfilePage = lazy(() => import('@/pages/Profile/ProfilePage').then(m => ({ default: m.ProfilePage })))

const TAB_COMPONENTS: Partial<Record<Tab, ComponentType>> = {
    feed: FeedPage,
    activity: ActivityPage,
    profile: ProfilePage,
}

interface TabContentProps {
    activeTab: Tab
    role: UiRole
}

export const TabContent = ({ activeTab }: TabContentProps) => {
    const Component = TAB_COMPONENTS[activeTab]

    if (!Component) {
        return null
    }

    const ComponentToRender = Component as ComponentType

    return (
        <Suspense fallback={<div className="p-4 text-muted-foreground">Загрузка…</div>}>
            <ComponentToRender />
        </Suspense>
    )
}