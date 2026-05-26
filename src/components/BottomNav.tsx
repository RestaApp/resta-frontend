import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { getTabsForRole } from '@/constants/tabs'
import { Z_INDEX } from '@/shared/ui/zIndex'
import type { UiRole, Tab } from '@/types'
import { cn } from '@/utils/cn'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  role: UiRole
  hasIncompleteProfile?: boolean
}

export const BottomNav = ({
  activeTab,
  onTabChange,
  role,
  hasIncompleteProfile = false,
}: BottomNavProps) => {
  const { t } = useTranslation()
  const tabs = useMemo(() => getTabsForRole(role), [role])
  const reduceMotion = useReducedMotion()
  const activeIndex = Math.max(
    tabs.findIndex(tab => tab.id === activeTab),
    0
  )

  return (
    <nav
      aria-label={t('nav.bottomNav')}
      style={{
        zIndex: Z_INDEX.bottomNav,
      }}
      className="fixed bottom-0 left-0 right-0 px-2.5 pb-safe-nav"
    >
      <div className="ui-app-frame pointer-events-none">
        <div
          className={cn(
            'pointer-events-auto relative mx-auto flex h-15 w-full max-w-lg items-center overflow-hidden rounded-full border border-border/60 bg-background/65 p-0.5 backdrop-blur-xl',
            tabs.length === 4 ? 'grid grid-cols-4' : 'grid grid-cols-2'
          )}
        >
          <motion.span
            className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-elevated/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_-1px_1px_rgba(0,0,0,0.2)]"
            style={{ width: `${100 / tabs.length}%` }}
            animate={{ x: `${activeIndex * 100}%` }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
            }
            aria-hidden="true"
          />

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
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                onClick={() => onTabChange(id)}
                className={cn(
                  'relative z-10 flex h-full min-h-13 flex-col items-center justify-center gap-1 rounded-full px-2 py-1',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
              >
                <span className="relative flex size-5.5 items-center justify-center">
                  <Icon
                    className={cn(
                      'size-5.5 transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                    aria-hidden="true"
                  />

                  {showProfileDot && (
                    <span
                      className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-primary"
                      aria-hidden="true"
                    />
                  )}
                </span>

                <span
                  className={cn(
                    'text-xs font-semibold uppercase leading-none tracking-[0.04em] transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {labelText}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
