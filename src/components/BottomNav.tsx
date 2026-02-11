import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { getTabsForRole } from '@/constants/tabs'
import { isEmployeeRole } from '@/utils/roles'
import type { UiRole, Tab } from '@/types'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  role: UiRole
  layoutId?: string
  hasIncompleteProfile?: boolean
}

export const BottomNav = ({
  activeTab,
  onTabChange,
  role,
  layoutId = 'bottom-nav-active-tab',
  hasIncompleteProfile = false,
}: BottomNavProps) => {
  const { t } = useTranslation()
  const tabs = useMemo(() => getTabsForRole(role), [role])
  const isEmployee = isEmployeeRole(role)
  const reduceMotion = useReducedMotion()

  return (
    <nav
      aria-label={t('nav.bottomNav')}
      className={[
        'fixed bottom-0 left-0 right-0 z-50 border-t border-border safe-area-bottom',
        isEmployee ? 'bg-background/80 backdrop-blur-xl' : 'bg-background',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-around px-4 py-2">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id
          const showProfileDot = id === 'profile' && hasIncompleteProfile
          const labelText = t(label)
          const ariaLabel = showProfileDot
            ? `${labelText}. ${t('nav.fillProfileRequired')}`
            : labelText

          return (
            <motion.button
              key={id}
              type="button"
              aria-label={ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
              onClick={() => onTabChange(id)}
              className={[
                'relative flex min-h-[44px] min-w-[72px] flex-col items-center justify-center rounded-xl px-3 py-2',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              ].join(' ')}
            >
              <span className="relative">
                <Icon
                  className={[
                    'h-6 w-6 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  ].join(' ')}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />

                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute -inset-2 -z-10 rounded-full"
                    style={{ background: 'var(--gradient-glow)' }}
                    transition={reduceMotion ? { duration: 0 } : undefined}
                    aria-hidden="true"
                  />
                )}

                {showProfileDot && (
                  <span
                    className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-primary"
                    aria-hidden="true"
                  />
                )}
              </span>

              <span
                className={[
                  'mt-1 text-xs transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                ].join(' ')}
              >
                {labelText}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
