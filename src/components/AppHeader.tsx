import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { AddShiftOnboardingOverlay } from '@/features/activity/ui/components/AddShiftOnboardingOverlay'
import { Edit2, Plus, SlidersHorizontal } from 'lucide-react'
import type { Tab, UiRole } from '@/types'
import { UI_ROLE_TO_API_ROLE } from '@/shared/types/roles.types'
import { APP_EVENTS, emitAppEvent, onAppEvent } from '@/shared/utils/appEvents'

interface AppHeaderProps {
  onAddShift?: () => void
  activeTab?: Tab
  role?: UiRole
}

type HeaderAction = {
  ariaLabel: string
  Icon: typeof Edit2
  onClick: () => void
}

type TranslateFn = (key: string, options?: Record<string, unknown>) => string

const HEADER_ACTION_BUTTON_CLASS = 'min-w-[44px] min-h-[44px] p-0 rounded-full flex-shrink-0'

const getHeaderTitle = (activeTab: Tab | undefined, t: TranslateFn) => {
  if (activeTab === 'feed') return t('tabs.employee.feed', { defaultValue: 'Поиск' })
  if (activeTab === 'activity') return t('tabs.employee.activity', { defaultValue: 'Активность' })
  if (activeTab === 'profile') return t('tabs.employee.profile', { defaultValue: 'Профиль' })
  if (!activeTab) return ''

  const candidates = [
    `tabs.employee.${activeTab}`,
    `tabs.venue.${activeTab}`,
    `tabs.supplier.${activeTab}`,
  ]
  for (const key of candidates) {
    const v = t(key, { defaultValue: '' })
    if (v) return v
  }
  return ''
}

const getHeaderAction = (params: {
  activeTab: Tab | undefined
  t: TranslateFn
  onAddShift?: () => void
  role?: UiRole
  isEmployeeFlow: boolean
}): HeaderAction | null => {
  const { activeTab, t, onAddShift, role, isEmployeeFlow } = params

  const venueAddShiftAction = (): HeaderAction => ({
    ariaLabel: t('feed.venueEmptyCta', {
      defaultValue: 'Создать вакансию или смену',
    }),
    Icon: Plus,
    onClick: () => {
      onAddShift?.()
      emitAppEvent(APP_EVENTS.OPEN_ACTIVITY_ADD_SHIFT)
    },
  })

  if (activeTab === 'feed') {
    if (role === 'venue') {
      return venueAddShiftAction()
    }

    return {
      ariaLabel: t('feed.openFilters', { defaultValue: 'Фильтры' }),
      Icon: SlidersHorizontal,
      onClick: () => emitAppEvent(APP_EVENTS.OPEN_FEED_FILTERS),
    }
  }

  if (activeTab === 'activity') {
    if (role === 'venue') {
      return venueAddShiftAction()
    }

    return {
      ariaLabel: isEmployeeFlow ? t('shift.offerShiftAria') : t('shift.addShiftAria'),
      Icon: Plus,
      onClick: () => {
        onAddShift?.()
        emitAppEvent(APP_EVENTS.OPEN_ACTIVITY_ADD_SHIFT)
      },
    }
  }

  if (activeTab === 'profile') {
    return {
      ariaLabel: t('aria.editProfile'),
      Icon: Edit2,
      onClick: () => emitAppEvent(APP_EVENTS.OPEN_PROFILE_EDIT),
    }
  }

  if (activeTab === 'suppliers') {
    return {
      ariaLabel: t('feed.openFilters', { defaultValue: 'Фильтры' }),
      Icon: SlidersHorizontal,
      onClick: () => emitAppEvent(APP_EVENTS.OPEN_SUPPLIERS_FILTERS),
    }
  }

  if (activeTab === 'home' && role === 'supplier') {
    return {
      ariaLabel: t('feed.openFilters', { defaultValue: 'Фильтры' }),
      Icon: SlidersHorizontal,
      onClick: () => emitAppEvent(APP_EVENTS.OPEN_SUPPLIERS_FILTERS),
    }
  }

  return null
}

export const AppHeader = ({ onAddShift, activeTab, role }: AppHeaderProps) => {
  const { t } = useTranslation()
  const [showAddShiftOnboarding, setShowAddShiftOnboarding] = useState(false)
  const actionButtonRef = useRef<HTMLButtonElement | null>(null)
  const isEmployeeFlow = role != null && UI_ROLE_TO_API_ROLE[role] === 'employee'

  const isActivity = activeTab === 'activity'

  const title = useMemo(() => getHeaderTitle(activeTab, t), [activeTab, t])
  const action = useMemo(
    () => getHeaderAction({ activeTab, t, onAddShift, role, isEmployeeFlow }),
    [activeTab, isEmployeeFlow, onAddShift, role, t]
  )

  const dismissAddShiftOnboarding = useCallback(() => {
    setShowAddShiftOnboarding(false)
  }, [])

  const handleProxyActionClick = useCallback(() => {
    dismissAddShiftOnboarding()
    actionButtonRef.current?.click()
  }, [dismissAddShiftOnboarding])

  useEffect(() => {
    return onAppEvent(APP_EVENTS.SHOW_ACTIVITY_ADD_SHIFT_ONBOARDING, () => {
      setShowAddShiftOnboarding(true)
    })
  }, [])

  return (
    <>
      {isActivity && showAddShiftOnboarding ? (
        <AddShiftOnboardingOverlay
          visible
          targetRef={actionButtonRef}
          onClose={dismissAddShiftOnboarding}
          onProxyClick={handleProxyActionClick}
          ariaLabel={isEmployeeFlow ? t('shift.offerShiftAria') : undefined}
          tooltipText={isEmployeeFlow ? t('activity.addShiftOnboardingTextEmployee') : undefined}
        />
      ) : null}

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          'flex items-center bg-background ui-density-page ui-density-py-sm',
          'border-b border-[var(--surface-stroke-soft)]'
        )}
      >
        <div className="flex w-full min-h-[44px] items-center justify-between gap-3">
          <h1 className="font-display text-3xl leading-tight tracking-tight truncate">{title}</h1>

          {action ? (
            <Button
              ref={actionButtonRef}
              variant="gradient"
              size="sm"
              onClick={action.onClick}
              aria-label={action.ariaLabel}
              className={HEADER_ACTION_BUTTON_CLASS}
            >
              <action.Icon className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
      </motion.header>
    </>
  )
}
