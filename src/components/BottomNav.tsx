import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { getTabsForRole } from '@/constants/tabs'
import { Z_INDEX } from '@/shared/ui/zIndex'
import type { UiRole, Tab } from '@/types'
import { getRoleTheme } from '@/shared/lib/role-theme'

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
  const roleTheme = getRoleTheme(role)
  const reduceMotion = useReducedMotion()
  const activeColorClass = roleTheme.classes.text
  const activeDotClass = roleTheme.classes.bg
  const focusRingClass =
    roleTheme.classes.ring === 'ring-role-employee'
      ? 'focus-visible:ring-role-employee'
      : roleTheme.classes.ring === 'ring-role-restaurant'
        ? 'focus-visible:ring-role-restaurant'
        : 'focus-visible:ring-role-supplier'

  return (
    <nav
      aria-label={t('nav.bottomNav')}
      style={{
        zIndex: Z_INDEX.bottomNav,
        paddingBottom: 'var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom))',
      }}
      className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/92 backdrop-blur-xl"
    >
      <div
        className={[
          'mx-auto grid max-w-2xl items-center px-1.5 pt-1.5 pb-2',
          tabs.length === 4 ? 'grid-cols-4' : 'grid-cols-2',
        ].join(' ')}
      >
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
                'relative flex min-h-[52px] flex-col items-center justify-center rounded-[10px] px-2 py-1 gap-[3px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                focusRingClass,
              ].join(' ')}
            >
              <span className="relative flex h-[22px] w-[22px] items-center justify-center">
                <Icon
                  className={[
                    'transition-colors',
                    'h-[22px] w-[22px]',
                    isActive ? activeColorClass : 'text-muted-foreground',
                  ].join(' ')}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />

                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    className={['absolute -top-[7px] h-1.5 w-4 rounded-[3px]', activeDotClass].join(
                      ' '
                    )}
                    transition={
                      reduceMotion ? { duration: 0 } : { duration: 0.28, ease: 'easeOut' }
                    }
                    aria-hidden="true"
                  />
                )}

                {showProfileDot && (
                  <span
                    className={[
                      'absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background',
                      activeDotClass,
                    ].join(' ')}
                    aria-hidden="true"
                  />
                )}
              </span>

              <span
                className={[
                  'font-semibold uppercase leading-none tracking-[0.04em] transition-colors text-[9px]',
                  isActive ? activeColorClass : 'text-muted-foreground',
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
