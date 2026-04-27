import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import type { UiRole, RoleOption } from '@/shared/types/roles.types'

interface RoleCardProps {
  role: RoleOption
  isSelected: boolean
  index: number
  onSelect: (roleId: UiRole) => void
  showPopularBadge?: boolean
  socialProof?: string
}

const ROLE_SOCIAL_PROOF: Partial<Record<UiRole, string>> = {
  chef: '892 сотрудника в сети',
  venue: '340 заведений · Минск',
  supplier: '128 поставщиков',
}

export const RoleCard = memo(function RoleCard({
  role,
  isSelected,
  index,
  onSelect,
  showPopularBadge = false,
  socialProof,
}: RoleCardProps) {
  const { t } = useTranslation()
  const proof = socialProof ?? ROLE_SOCIAL_PROOF[role.id]
  const handleClick = useCallback(() => onSelect(role.id), [role.id, onSelect])
  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <div className="relative">
      {showPopularBadge ? (
        <span className="absolute -top-3 left-3 z-10 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase text-white shadow-sm">
          {t('roles.mostPopularBadge', { defaultValue: 'Популярно' })}
        </span>
      ) : null}

      <motion.button
        type="button"
        whileTap={{ scale: 0.985 }}
        onClick={handleClick}
        aria-label={t('aria.selectRole', { label: role.title })}
        aria-pressed={isSelected}
        className={cn(
          'w-full rounded-2xl border p-4 text-left transition-all duration-150',
          showPopularBadge ? 'pt-6' : '',
          isSelected
            ? 'border-primary bg-primary/8 shadow-sm'
            : 'border-border bg-card hover:border-border/80'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                'text-base font-semibold leading-tight',
                isSelected ? 'text-foreground' : 'text-foreground'
              )}
            >
              {role.title}
            </div>
            {role.description ? (
              <div className="mt-1 text-sm text-muted-foreground leading-snug">
                {role.description}
              </div>
            ) : null}
          </div>

          <span
            className={cn(
              'font-mono-resta text-sm font-medium shrink-0 mt-0.5',
              isSelected ? 'text-primary' : 'text-muted-foreground/50'
            )}
          >
            {indexLabel}
          </span>
        </div>

        {proof ? (
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full shrink-0',
                isSelected ? 'bg-primary' : 'bg-primary/50'
              )}
              aria-hidden
            />
            <span className="font-mono-resta text-xs text-primary/80 font-medium">{proof}</span>
          </div>
        ) : null}
      </motion.button>
    </div>
  )
})
