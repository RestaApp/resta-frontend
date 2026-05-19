import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { BLOCK_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/utils/cn'
import type { UiRole, RoleOption } from '@/shared/types/roles.types'

const ROLE_EMOJI: Record<UiRole, string> = {
  chef: '👨‍🍳',
  waiter: '🍽️',
  bartender: '🍸',
  barista: '☕',
  hostess: '🙋',
  delivery: '🚚',
  cashier: '💳',
  office: '💼',
  admin: '🧑‍💼',
  manager: '📋',
  support: '🎧',
  venue: '🏪',
  supplier: '🚚',
}

interface RoleCardProps {
  role: RoleOption
  isSelected: boolean
  index: number
  onSelect: (roleId: UiRole) => void
  showPopularBadge?: boolean
  socialProof?: string
}

function defaultSocialProofFromI18n(
  roleId: UiRole,
  translate: (key: string) => string
): string | undefined {
  switch (roleId) {
    case 'chef':
      return translate('roles.socialProof.chef')
    case 'venue':
      return translate('roles.socialProof.venue')
    case 'supplier':
      return translate('roles.socialProof.supplier')
    default:
      return undefined
  }
}

export const RoleCard = memo(function RoleCard({
  role,
  isSelected,
  onSelect,
  showPopularBadge = false,
  socialProof,
}: RoleCardProps) {
  const { t } = useTranslation()
  const proof = socialProof ?? defaultSocialProofFromI18n(role.id, t)
  const emoji = ROLE_EMOJI[role.id] ?? '👤'
  const handleClick = useCallback(() => onSelect(role.id), [role.id, onSelect])

  return (
    <div className="relative">
      {showPopularBadge ? (
        <span className="absolute -top-2 left-[14px] z-10 inline-flex items-center rounded-[4px] bg-primary px-2 py-[3px] font-mono-resta text-xs font-semibold tracking-[0.08em] uppercase text-white">
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
          'w-full rounded-2xl border px-[22px] py-[18px] text-left transition-all duration-150',
          showPopularBadge ? 'pt-7' : '',
          isSelected
            ? 'border-primary bg-primary/14'
            : 'border-border bg-card hover:border-foreground/20'
        )}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-2xl leading-none"
            aria-hidden
          >
            {emoji}
          </div>

          <div className="min-w-0 flex-1">
            <div className={BLOCK_TITLE_CLASS}>{role.title}</div>
            {role.description ? (
              <div className="mt-1 text-sm leading-snug text-muted-foreground">
                {role.description}
              </div>
            ) : null}
          </div>

          <div
            className={cn(
              'grid h-7 w-7 shrink-0 place-items-center rounded-full border-2',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-transparent'
            )}
            aria-hidden
          >
            {isSelected ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
          </div>
        </div>

        {proof ? (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                'font-mono-resta font-medium tracking-[0.12em]',
                isSelected ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {proof}
            </span>
          </div>
        ) : null}
      </motion.button>
    </div>
  )
})
