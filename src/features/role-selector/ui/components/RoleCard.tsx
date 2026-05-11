import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
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
        <span className="absolute -top-2 left-[14px] z-10 inline-flex items-center rounded-[4px] bg-primary px-2 py-[3px] font-mono-resta text-micro font-semibold tracking-[0.08em] uppercase text-white">
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
          'w-full rounded-lg border px-[18px] py-[18px] text-left transition-all duration-150',
          showPopularBadge ? 'pt-7' : '',
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-foreground/20'
        )}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className={cn(
              'flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] text-[22px] leading-none',
              isSelected ? 'bg-primary/15' : 'bg-[#1B1A18]'
            )}
            aria-hidden
          >
            {emoji}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-title-md font-semibold leading-tight tracking-[-0.01em] text-foreground">
              {role.title}
            </div>
            {role.description ? (
              <div className="mt-1 text-body-md leading-snug text-muted-foreground">
                {role.description}
              </div>
            ) : null}
          </div>

          <div
            className={cn(
              'font-mono-resta text-meta font-medium shrink-0',
              isSelected ? 'text-primary/90' : 'text-muted-foreground'
            )}
            aria-hidden
          >
            {isSelected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
          </div>
        </div>

        {proof ? (
          <div className="mt-3 border-t border-dashed border-border pt-3 flex items-center gap-1.5">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full shrink-0',
                isSelected ? 'bg-primary' : 'bg-primary/50'
              )}
              aria-hidden
            />
            <span className="font-mono-resta text-meta font-medium tracking-[0.05em] text-primary/75">
              {proof}
            </span>
          </div>
        ) : null}
      </motion.button>
    </div>
  )
})
