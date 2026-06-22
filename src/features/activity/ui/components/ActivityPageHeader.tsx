import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type TabOption } from '@/components/ui/tabs'
import { AddShiftOnboardingOverlay } from '@/shared/ui/add-shift/AddShiftOnboardingOverlay'
import { ScreenTabsHeader } from '@/components/ui/screen-tabs-header'
import { NotificationsBell } from '@/shared/ui/NotificationsBell'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'
import type { HeaderAction } from '@/components/appHeaderConfig'

type ActivityPageHeaderProps<T extends string> = {
  title: string
  action: HeaderAction | null
  showAddShiftOnboarding?: boolean
  tabOptions?: TabOption<T>[]
  activeTabId?: T
  onTabChange?: (id: T) => void
}

const ActivityPageHeaderInner = <T extends string>({
  title,
  action,
  showAddShiftOnboarding = false,
  tabOptions,
  activeTabId,
  onTabChange,
}: ActivityPageHeaderProps<T>) => {
  const { t } = useTranslation()
  const actionButtonRef = useRef<HTMLButtonElement | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false)
  }, [])

  const handleProxyActionClick = useCallback(() => {
    dismissOnboarding()
    actionButtonRef.current?.click()
  }, [dismissOnboarding])

  useEffect(() => {
    if (!showAddShiftOnboarding) return
    return onAppEvent(APP_EVENTS.SHOW_ACTIVITY_ADD_SHIFT_ONBOARDING, () => {
      setShowOnboarding(true)
    })
  }, [showAddShiftOnboarding])

  return (
    <>
      {showAddShiftOnboarding && showOnboarding && action ? (
        <AddShiftOnboardingOverlay
          visible
          targetRef={actionButtonRef}
          onClose={dismissOnboarding}
          onProxyClick={handleProxyActionClick}
          ariaLabel={t('shift.offerShiftAria')}
          tooltipText={t('activity.addShiftOnboardingTextEmployee')}
        />
      ) : null}

      <ScreenTabsHeader
        title={title}
        tabOptions={tabOptions}
        activeTabId={activeTabId}
        onTabChange={onTabChange}
        action={action}
        leadingActionsSlot={<NotificationsBell />}
        actionButtonRef={actionButtonRef}
      />
    </>
  )
}

export const ActivityPageHeader = memo(ActivityPageHeaderInner) as typeof ActivityPageHeaderInner
