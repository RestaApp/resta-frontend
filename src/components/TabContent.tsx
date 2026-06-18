import { lazy, type ComponentType, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { PageSuspense } from '@/components/ui/PageSuspense'
import { ProfileSkeleton } from '@/components/ui/profile-skeleton'
import { FeedCardSkeletonList } from '@/components/ui/shift-skeleton'
import { FeedHeader } from '@/features/feed/ui/components/FeedHeader'
import { ActivityPageHeader } from '@/features/activity/ui/components/ActivityPageHeader'
import { StaffPageHeader } from '@/features/venue/ui/staff/StaffPageHeader'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole } from '@/store/slices/userSlice'
import type { Tab } from '@/shared/types/navigation.types'
import type { ActivityTab } from '@/shared/types/activity.types'
import type { FeedType } from '@/shared/shifts/types'
import type { TabOption } from '@/components/ui/tabs'
import {
  getHeaderAction,
  getHeaderTitle,
  resolveIsEmployeeFlow,
} from '@/components/appHeaderConfig'

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
const suppliersSkeletonFallback = (
  <FeedCardSkeletonList variant="supplier" className="ui-density-page ui-density-py" />
)

const noop = () => {}

interface TabSuspenseFallbackProps {
  activeTab: Tab
}

const TabSuspenseFallback = ({ activeTab }: TabSuspenseFallbackProps) => {
  const { t } = useTranslation()
  const selectedRole = useAppSelector(selectSelectedRole)

  const feedTypeOptions: TabOption<FeedType>[] = [
    { id: 'jobs', label: t('tabs.feed.jobs') },
    { id: 'shifts', label: t('tabs.feed.shifts') },
  ]

  const venueTabOptions: TabOption<'vacancies' | 'shifts'>[] = [
    { id: 'vacancies', label: t('tabs.feed.jobs') },
    { id: 'shifts', label: t('tabs.feed.shifts') },
  ]

  if (activeTab === 'feed') {
    return (
      <div className="bg-background ui-density-stack">
        <FeedHeader
          options={feedTypeOptions}
          feedType="jobs"
          onChangeFeedType={noop}
          activeFilters={[]}
          onResetFilters={noop}
          onRemoveFilter={noop}
        />
        <FeedCardSkeletonList className="ui-density-page ui-density-py" />
      </div>
    )
  }

  if (activeTab === 'activity' || activeTab === 'myshifts') {
    const isVenue = selectedRole === 'venue'
    const isEmployeeFlow = resolveIsEmployeeFlow(selectedRole)

    return (
      <div className="bg-background">
        <ActivityPageHeader
          title={getHeaderTitle(activeTab, t, selectedRole)}
          action={getHeaderAction({
            activeTab,
            t,
            role: selectedRole,
            isEmployeeFlow,
          })}
          {...(isVenue
            ? {
                tabOptions: venueTabOptions,
                activeTabId: 'vacancies' as const,
                onTabChange: noop,
              }
            : {})}
        />
        <div className="ui-density-page ui-density-py">
          <FeedCardSkeletonList />
        </div>
      </div>
    )
  }

  if (activeTab === 'staff') {
    return (
      <div className="bg-background">
        <StaffPageHeader
          pendingApplicationsCount={0}
          onOpenFilters={noop}
          onOpenApplications={noop}
        />
        <FeedCardSkeletonList variant="staff" className="ui-density-page ui-density-py" />
      </div>
    )
  }

  if (activeTab === 'suppliers' || activeTab === 'home' || activeTab === 'showcase') {
    return suppliersSkeletonFallback
  }

  if (activeTab === 'profile') {
    return profileSkeletonFallback
  }

  return cardSkeletonFallback
}

const TAB_CONFIG: Partial<Record<Tab, { component: ComponentType; fallback?: ReactNode }>> = {
  feed: { component: FeedPage, fallback: cardSkeletonFallback },
  profile: { component: ProfilePage, fallback: profileSkeletonFallback },
  staff: { component: VenueStaffPage, fallback: staffSkeletonFallback },
  suppliers: { component: VenueSuppliersPage, fallback: suppliersSkeletonFallback },
  home: { component: VenueSuppliersPage, fallback: suppliersSkeletonFallback },
  showcase: { component: VenueSuppliersPage, fallback: suppliersSkeletonFallback },
}

interface TabContentProps {
  activeTab: Tab
}

export const TabContent = ({ activeTab }: TabContentProps) => {
  const employeeActivityDefaultTab: ActivityTab =
    activeTab === 'myshifts' ? 'shifts' : 'applications'

  if (activeTab === 'activity' || activeTab === 'myshifts') {
    return (
      <PageSuspense fallback={<TabSuspenseFallback activeTab={activeTab} />}>
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
  const suspenseFallback =
    activeTab === 'feed' || activeTab === 'staff' ? (
      <TabSuspenseFallback activeTab={activeTab} />
    ) : (
      fallback
    )

  return (
    <PageSuspense fallback={suspenseFallback}>
      <Component />
    </PageSuspense>
  )
}
