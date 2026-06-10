import { lazy, type ComponentType, type ReactNode } from 'react'
import { PageSuspense } from '@/components/ui/PageSuspense'
import { ProfileSkeleton } from '@/components/ui/profile-skeleton'
import { FeedCardSkeletonList } from '@/components/ui/shift-skeleton'
import type { Tab } from '@/shared/types/navigation.types'
import type { ActivityTab } from '@/shared/types/activity.types'

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

const cardSkeletonFallback = <FeedCardSkeletonList className="ui-density-page ui-density-py" />
const profileSkeletonFallback = (
  <div className="pb-24 ui-density-page ui-density-py">
    <ProfileSkeleton variant="page" />
  </div>
)
const staffSkeletonFallback = (
  <FeedCardSkeletonList variant="staff" className="ui-density-page ui-density-py" />
)

const TAB_CONFIG: Partial<Record<Tab, { component: ComponentType; fallback?: ReactNode }>> = {
  feed: { component: FeedPage, fallback: cardSkeletonFallback },
  profile: { component: ProfilePage, fallback: profileSkeletonFallback },
  staff: { component: VenueStaffPage, fallback: staffSkeletonFallback },
  suppliers: { component: VenueSuppliersPage, fallback: cardSkeletonFallback },
  home: { component: VenueSuppliersPage, fallback: cardSkeletonFallback },
  showcase: { component: VenueSuppliersPage, fallback: cardSkeletonFallback },
}

interface TabContentProps {
  activeTab: Tab
}

export const TabContent = ({ activeTab }: TabContentProps) => {
  const employeeActivityDefaultTab: ActivityTab =
    activeTab === 'myshifts' ? 'shifts' : 'applications'

  if (activeTab === 'activity' || activeTab === 'myshifts') {
    return (
      <PageSuspense fallback={cardSkeletonFallback}>
        <ActivityPage
          key={activeTab}
          screenTab={activeTab}
          employeeDefaultTab={employeeActivityDefaultTab}
        />
      </PageSuspense>
    )
  }

  const config = TAB_CONFIG[activeTab]
  if (!config) return null

  const { component: Component, fallback } = config

  return (
    <PageSuspense fallback={fallback}>
      <Component />
    </PageSuspense>
  )
}
