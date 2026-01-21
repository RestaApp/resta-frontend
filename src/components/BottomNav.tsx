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
  const tabs = getTabsForRole(role)
  const isEmployee = isEmployeeRole(role)
  const reduceMotion = useReducedMotion()

  return (
    <nav
      aria-label="Нижняя навигация"
      className={[
        'fixed bottom-0 left-0 right-0 z-50 border-t border-border safe-area-bottom',
        isEmployee ? 'bg-background/80 backdrop-blur-xl' : 'bg-background',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-around px-4 py-2">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id

          return (
            <motion.button
              key={id}
              type="button"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
              onClick={() => onTabChange(id)}
              className={[
                'relative flex min-h-[44px] min-w-[72px] flex-col items-center justify-center rounded-xl px-3 py-2',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink-electric)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              ].join(' ')}
            >
              <span className="relative">
                <Icon
                  className={[
                    'h-6 w-6 transition-colors',
                    isActive ? 'text-[var(--pink-electric)]' : 'text-muted-foreground',
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
                  />
                )}

                {/* Индикатор незаполненного профиля на вкладке профиля */}
                {id === 'profile' && hasIncompleteProfile && (
                  <span
                    className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background"
                    style={{ backgroundColor: 'var(--pink-electric)' }}
                    aria-label="Требуется заполнить профиль"
                  />
                )}
              </span>

              <span
                className={[
                  'mt-1 text-xs transition-colors',
                  isActive ? 'text-[var(--pink-electric)]' : 'text-muted-foreground',
                ].join(' ')}
              >
                {label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
