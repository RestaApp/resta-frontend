import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion, useTransform } from 'motion/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AVATAR_SHAPE_CLASS } from '@/components/ui/avatar-styles'
import { getTabsForRole } from '@/shared/constants/tabs'
import { useBottomNavCollapse } from '@/shared/lib/hooks/useBottomNavCollapse'
import { useReducedVisualEffects } from '@/shared/lib/hooks/useReducedVisualEffects'
import { Z_INDEX } from '@/shared/ui/zIndex'
import type { Tab } from '@/shared/types/navigation.types'
import type { UiRole } from '@/shared/types/roles.types'
import { cn } from '@/shared/utils/cn'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  role: UiRole
  hasIncompleteProfile?: boolean
  currentUserPhotoUrl?: string | null
}

export const BottomNav = ({
  activeTab,
  onTabChange,
  role,
  hasIncompleteProfile = false,
  currentUserPhotoUrl = null,
}: BottomNavProps) => {
  const { t } = useTranslation()
  const tabs = useMemo(() => getTabsForRole(role), [role])
  const reduceMotion = useReducedMotion()
  const reduceVisualEffects = useReducedVisualEffects()
  const collapse = useBottomNavCollapse()
  const barHeight = useTransform(collapse, [0, 1], ['3.25rem', '2.75rem'])
  const labelOpacity = useTransform(collapse, [0, 0.45], [1, 0])
  const labelMaxHeight = useTransform(collapse, [0, 1], ['0.75rem', '0rem'])
  const iconSize = useTransform(collapse, [0, 1], ['1.375rem', '1.25rem'])
  const buttonGap = useTransform(collapse, [0, 1], ['0.25rem', '0rem'])
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
        <motion.div
          style={{ height: barHeight }}
          className={cn(
            'pointer-events-auto relative mx-auto flex w-full max-w-lg items-center overflow-hidden rounded-full border border-border/60 p-0.5',
            reduceVisualEffects ? 'bg-background/95' : 'bg-background/65 backdrop-blur-xl',
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
                data-haptic="light"
                style={{ gap: buttonGap }}
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                onClick={() => onTabChange(id)}
                className={cn(
                  'relative z-10 flex h-full min-h-11 flex-col items-center justify-center rounded-full px-2 py-0.5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
              >
                <motion.span
                  className="relative flex items-center justify-center"
                  style={{ width: iconSize, height: iconSize }}
                >
                  {id === 'myshifts' ? (
                    <Avatar
                      className={cn(
                        AVATAR_SHAPE_CLASS,
                        'size-6 border transition-colors',
                        isActive ? 'border-primary' : 'border-border'
                      )}
                    >
                      <AvatarImage src={currentUserPhotoUrl} alt="" />
                      <AvatarFallback className="bg-transparent">
                        <Icon
                          className={cn(
                            'size-5 transition-colors',
                            isActive ? 'text-primary' : 'text-muted-foreground'
                          )}
                          strokeWidth={isActive ? 2.5 : 2}
                          aria-hidden="true"
                        />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Icon
                      className={cn(
                        'size-full transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                      aria-hidden="true"
                    />
                  )}

                  {showProfileDot && (
                    <span
                      className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-primary"
                      aria-hidden="true"
                    />
                  )}
                </motion.span>

                <motion.span
                  style={{ opacity: labelOpacity, maxHeight: labelMaxHeight }}
                  className={cn(
                    'overflow-hidden text-xs font-semibold uppercase leading-none tracking-wider transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {labelText}
                </motion.span>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </nav>
  )
}
