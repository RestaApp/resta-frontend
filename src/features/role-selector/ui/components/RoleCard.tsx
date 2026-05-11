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

const ROLE_EMOJI: Record<UiRole, string> = {
  chef: '👨‍🍳',
  venue: '🏪',
  supplier: '🚚',
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
        <span className="absolute -top-2 left-[14px] z-10 inline-flex items-center rounded-[4px] bg-primary px-2 py-[3px] font-mono-resta text-[10px] font-semibold tracking-[0.08em] uppercase text-white">
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
          'w-full rounded-[14px] border p-[14px] text-left transition-colors duration-150',
          showPopularBadge ? 'pt-5' : '',
          isSelected
            ? 'border-primary bg-primary/[0.08]'
            : 'border-[#2F2C28] bg-[#11100F] hover:border-[#46413B]'
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
            <div className="text-[14px] font-semibold leading-tight text-foreground">
              {role.title}
            </div>
            {role.description ? (
              <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {role.description}
              </div>
            ) : null}
          </div>

          <div
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
              isSelected ? 'border-primary bg-primary text-white' : 'border-[#2F2C28] bg-transparent'
            )}
            aria-hidden
          >
            {isSelected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
          </div>
        </div>

        {proof ? (
          <div
            className={cn(
              'font-mono-resta text-[11px] tracking-[0.05em]',
              isSelected ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {proof}
          </div>
        ) : null}
      </motion.button>
    </div>
  )
})
