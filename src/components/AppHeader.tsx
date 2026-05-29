import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import {
  APP_HEADER_ACTION_BUTTON_CLASS,
  APP_HEADER_ACTION_ICON_CLASS,
  SCREEN_TITLE_CLASS,
} from '@/components/ui/ui-patterns'
import { AddShiftOnboardingOverlay } from '@/features/activity/ui/components/AddShiftOnboardingOverlay'
import { Edit2, Plus, Settings, SlidersHorizontal } from 'lucide-react'
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

const getHeaderTitle = (activeTab: Tab | undefined, t: TranslateFn) => {
  if (activeTab === 'feed') return t('feed.headerTitle', { defaultValue: 'Лента' })
  if (activeTab === 'activity') return t('tabs.employee.activity', { defaultValue: 'Активность' })
  if (activeTab === 'myshifts') return t('tabs.employee.my', { defaultValue: 'Мои' })
  if (activeTab === 'profile') return t('tabs.employee.profileShort', { defaultValue: 'Я' })
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

  if (activeTab === 'activity' || activeTab === 'myshifts') {
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
      Icon: Settings,
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

  const isActivity = activeTab === 'activity' || activeTab === 'myshifts'

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
          'flex items-center bg-background/95 backdrop-blur-xl ui-density-page ui-density-py-sm',
          activeTab === 'profile' ? 'border-b border-transparent' : 'border-b border-border'
        )}
      >
        <div className="ui-app-frame flex min-h-12 items-center justify-between gap-3">
          <h1 className={SCREEN_TITLE_CLASS}>{title}</h1>

          {action ? (
            <Button
              ref={actionButtonRef}
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              aria-label={action.ariaLabel}
              className={cn(APP_HEADER_ACTION_BUTTON_CLASS)}
            >
              <action.Icon className={APP_HEADER_ACTION_ICON_CLASS} />
            </Button>
          ) : null}
        </div>
      </motion.header>
    </>
  )
}
