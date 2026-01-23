import { Suspense, lazy, type ComponentType } from 'react'
import { Loader } from '@/components/ui/loader'
import type { Tab, UiRole } from '@/types'

const FeedPage = lazy(() => import('@/features/feed/ui/FeedPage').then(m => ({ default: m.FeedPage })))
const ActivityPage = lazy(() => import('@/features/activity/ui/ActivityPage').then(m => ({ default: m.ActivityPage })))
const ProfilePage = lazy(() => import('@/features/profile/ui/ProfilePage').then(m => ({ default: m.ProfilePage })))

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
        <Suspense fallback={
            <div className="flex items-center justify-center py-12">
                <Loader size="lg" />
            </div>
        }>
            <ComponentToRender />
        </Suspense>
    )
}