import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useTelegram } from '@/contexts/TelegramContext'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { AddShiftOnboardingOverlay } from '@/features/activity/ui/components/AddShiftOnboardingOverlay'
import { Edit2, Plus, SlidersHorizontal } from 'lucide-react'
import type { Tab } from '@/types'

interface AppHeaderProps {
  onAddShift?: () => void
  activeTab?: Tab
}

type HeaderAction = {
  ariaLabel: string
  Icon: typeof Edit2
  onClick: () => void
}

const HEADER_ACTION_BUTTON_CLASS =
  'min-w-[44px] min-h-[44px] p-0 rounded-full flex-shrink-0'

const getHeaderTitle = (activeTab: Tab | undefined, t: (key: string, options?: any) => string) => {
  if (activeTab === 'feed') return t('tabs.employee.feed', { defaultValue: 'Поиск' })
  if (activeTab === 'activity') return t('tabs.employee.activity', { defaultValue: 'Активность' })
  if (activeTab === 'profile') return t('tabs.employee.profile', { defaultValue: 'Профиль' })
  if (!activeTab) return ''

  const candidates = [`tabs.employee.${activeTab}`, `tabs.venue.${activeTab}`, `tabs.supplier.${activeTab}`]
  for (const key of candidates) {
    const v = t(key, { defaultValue: '' })
    if (v) return v
  }
  return ''
}

const getHeaderAction = (params: {
  activeTab: Tab | undefined
  t: (key: string, options?: any) => string
  onAddShift?: () => void
}): HeaderAction | null => {
  const { activeTab, t, onAddShift } = params

  if (activeTab === 'feed') {
    return {
      ariaLabel: t('feed.openFilters', { defaultValue: 'Фильтры' }),
      Icon: SlidersHorizontal,
      onClick: () => window.dispatchEvent(new CustomEvent('openFeedFilters')),
    }
  }

  if (activeTab === 'activity') {
    return {
      ariaLabel: t('shift.addShiftAria'),
      Icon: Plus,
      onClick: () => {
        onAddShift?.()
        window.dispatchEvent(new CustomEvent('openActivityAddShift'))
      },
    }
  }

  if (activeTab === 'profile') {
    return {
      ariaLabel: t('aria.editProfile'),
      Icon: Edit2,
      onClick: () => window.dispatchEvent(new CustomEvent('openProfileEdit')),
    }
  }

  return null
}

export const AppHeader = ({ onAddShift, activeTab }: AppHeaderProps) => {
  const { t } = useTranslation()
  const { isFullscreen } = useTelegram()
  const [showAddShiftOnboarding, setShowAddShiftOnboarding] = useState(false)
  const actionButtonRef = useRef<HTMLButtonElement | null>(null)

  const isActivity = activeTab === 'activity'

  const title = useMemo(() => getHeaderTitle(activeTab, t), [activeTab, t])
  const action = useMemo(
    () => getHeaderAction({ activeTab, t, onAddShift }),
    [activeTab, onAddShift, t]
  )

  const dismissAddShiftOnboarding = useCallback(() => {
    setShowAddShiftOnboarding(false)
  }, [])

  const handleProxyActionClick = useCallback(() => {
    dismissAddShiftOnboarding()
    actionButtonRef.current?.click()
  }, [dismissAddShiftOnboarding])

  useEffect(() => {
    const handler = () => setShowAddShiftOnboarding(true)
    window.addEventListener('showActivityAddShiftOnboarding', handler)
    return () => window.removeEventListener('showActivityAddShiftOnboarding', handler)
  }, [])

  return (
    <>
      {isActivity && showAddShiftOnboarding ? (
        <AddShiftOnboardingOverlay
          visible
          targetRef={actionButtonRef}
          onClose={dismissAddShiftOnboarding}
          onProxyClick={handleProxyActionClick}
        />
      ) : null}

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          isFullscreen ? 'mt-[65px]' : 'mt-0',
          'flex items-center bg-card px-4 py-3',
          'border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]'
        )}
      >
        <div className="flex w-full items-center justify-between gap-3">
          <h1 className="text-[22px] font-semibold leading-tight truncate">{title}</h1>

          {action ? (
            <Button
              ref={actionButtonRef}
              variant="gradient"
              size="sm"
              onClick={action.onClick}
              aria-label={action.ariaLabel}
              className={HEADER_ACTION_BUTTON_CLASS}
            >
              <action.Icon className="w-[22px] h-[22px]" />
            </Button>
          ) : null}
        </div>
      </motion.header>
    </>
  )
}
