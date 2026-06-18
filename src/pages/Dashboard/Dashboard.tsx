import { useCallback, useEffect } from 'react'
import { useDashboard } from '@/pages/Dashboard/hooks/useDashboard'
import { TabContent } from '@/components/TabContent'
import { BottomNav } from '@/components/BottomNav'
import { DetailOverlayRenderer } from '@/components/DetailOverlayRenderer'
import { VenueAddShiftListener } from '@/features/venue/ui/VenueAddShiftListener'
import { NotificationsDrawer } from '@/features/notifications/ui/NotificationsDrawer'
import { useProfileCompleteness } from '@/shared/lib/hooks/useProfileCompleteness'
import type { Tab, Screen } from '@/shared/types/navigation.types'
import type { UiRole } from '@/shared/types/roles.types'
import { AppHeader } from '@/components/AppHeader'
import { setLocalStorageItem } from '@/shared/utils/localStorage'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'
import { BOTTOM_NAV_HEIGHT_PX } from '@/shared/ui/layout'
import { resetAppScroll } from '@/shared/ui/appScroll'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'
import { getScreenForTab } from '@/shared/constants/navigation'
import { getPathForScreen } from '@/shared/constants/routePaths'

interface DashboardProps {
  role: UiRole
  onNavigate: (screen: Screen) => void
  currentScreen: Screen
}

export const Dashboard = ({ role, onNavigate, currentScreen }: DashboardProps) => {
  const { activeTab, handleTabChange } = useDashboard({ role, onNavigate, currentScreen })
  const { overlay, replaceOverlayWithPath } = useDetailOverlay()
  const profileCompleteness = useProfileCompleteness()
  const hasIncompleteFields = !profileCompleteness?.isFilled

  /** При переходе на профиль с незаполненными обязательными полями сразу открываем форму редактирования. */
  const onTabChange = useCallback(
    (tab: Tab) => {
      if (overlay) {
        const screen = getScreenForTab(role, tab)
        if (screen) {
          replaceOverlayWithPath(getPathForScreen(role, screen))
        }
      }
      if (tab === 'profile' && hasIncompleteFields) {
        setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT, 'true')
      }
      handleTabChange(tab)
      if (tab === 'profile' && hasIncompleteFields) {
        queueMicrotask(() => {
          emitAppEvent(APP_EVENTS.OPEN_PROFILE_EDIT)
        })
      }
    },
    [handleTabChange, hasIncompleteFields, overlay, replaceOverlayWithPath, role]
  )

  useEffect(() => {
    resetAppScroll()
    const raf = requestAnimationFrame(() => resetAppScroll())
    return () => cancelAnimationFrame(raf)
  }, [activeTab])

  return (
    <div className="bg-background" style={{ paddingBottom: BOTTOM_NAV_HEIGHT_PX }}>
      {activeTab === 'feed' ||
      activeTab === 'activity' ||
      activeTab === 'myshifts' ||
      activeTab === 'staff' ? null : (
        <AppHeader activeTab={activeTab} role={role} />
      )}
      {role === 'venue' ? <VenueAddShiftListener /> : null}
      <main className="ui-app-frame">
        <TabContent activeTab={activeTab} />
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        role={role}
        hasIncompleteProfile={hasIncompleteFields}
      />

      <DetailOverlayRenderer />
      <NotificationsDrawer />
    </div>
  )
}
