import { useCallback, useEffect } from 'react'
import { useDashboard } from '@/pages/Dashboard/hooks/useDashboard'
import { TabContent } from '@/components/TabContent'
import { BottomNav } from '@/components/BottomNav'
import { VenueAddShiftListener } from '@/features/venue/ui/VenueAddShiftListener'
import { useProfileCompleteness } from '@/features/profile/model/hooks/useProfileCompleteness'
import type { Tab, UiRole, Screen } from '@/types'
import { AppHeader } from '@/components/AppHeader'
import { setLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'

const BOTTOM_NAV_HEIGHT_PX = 88

interface DashboardProps {
  role: UiRole
  onNavigate: (screen: Screen) => void
  currentScreen: Screen
}

export const Dashboard = ({ role, onNavigate, currentScreen }: DashboardProps) => {
  const { activeTab, handleTabChange } = useDashboard({ role, onNavigate, currentScreen })
  const profileCompleteness = useProfileCompleteness()
  const hasIncompleteFields = !profileCompleteness?.isFilled

  /** При переходе на профиль с незаполненными обязательными полями сразу открываем форму редактирования. */
  const onTabChange = useCallback(
    (tab: Tab) => {
      if (tab === 'profile' && hasIncompleteFields) {
        setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT, 'true')
      }
      handleTabChange(tab)
      if (tab === 'profile' && hasIncompleteFields) {
        queueMicrotask(() => {
          window.dispatchEvent(new CustomEvent('openProfileEdit'))
        })
      }
    },
    [handleTabChange, hasIncompleteFields]
  )

  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      if (typeof document !== 'undefined') {
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      }
    }

    resetScroll()
    const raf = requestAnimationFrame(resetScroll)
    return () => cancelAnimationFrame(raf)
  }, [activeTab])

  return (
    <div className="bg-background" style={{ paddingBottom: BOTTOM_NAV_HEIGHT_PX }}>
      <AppHeader activeTab={activeTab} role={role} />
      {role === 'venue' ? <VenueAddShiftListener /> : null}
      <main className="mx-auto max-w-2xl">
        <TabContent activeTab={activeTab} />
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        role={role}
        hasIncompleteProfile={hasIncompleteFields}
      />
    </div>
  )
}
