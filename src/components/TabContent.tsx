import { lazy, type ComponentType } from 'react'
import { PageSuspense } from '@/components/ui/PageSuspense'
import type { Tab } from '@/types'
import type { ActivityTab } from '@/features/activity/model/hooks/useActivityPageModel'

const FeedPage = lazy(() =>
  import('@/features/feed/ui/FeedPage').then(m => ({ default: m.FeedPage }))
)
const ActivityPage = lazy(() =>
  import('@/features/activity/ui/ActivityPage').then(m => ({ default: m.ActivityPage }))
)
const ProfilePage = lazy(() =>
  import('@/features/profile/ui/ProfilePage').then(m => ({ default: m.ProfilePage }))
)
const VenueStaffPage = lazy(() =>
  import('@/features/venue/ui/VenueStaffPage').then(m => ({ default: m.VenueStaffPage }))
)
const VenueSuppliersPage = lazy(() =>
  import('@/features/venue/ui/VenueSuppliersPage').then(m => ({ default: m.VenueSuppliersPage }))
)

const TAB_COMPONENTS: Partial<Record<Tab, ComponentType>> = {
  feed: FeedPage,
  activity: ActivityPage,
  profile: ProfilePage,
  staff: VenueStaffPage,
  suppliers: VenueSuppliersPage,
  home: VenueSuppliersPage,
  showcase: VenueSuppliersPage,
  requests: ActivityPage,
}

interface TabContentProps {
  activeTab: Tab
}

export const TabContent = ({ activeTab }: TabContentProps) => {
  const employeeActivityDefaultTab: ActivityTab =
    activeTab === 'myshifts' ? 'shifts' : 'applications'

  if (activeTab === 'activity' || activeTab === 'myshifts') {
    return (
      <PageSuspense>
        <ActivityPage key={activeTab} employeeDefaultTab={employeeActivityDefaultTab} />
      </PageSuspense>
    )
  }

  const Component = TAB_COMPONENTS[activeTab]
  if (!Component) return null

  return (
    <PageSuspense>
      <Component />
    </PageSuspense>
  )
}
