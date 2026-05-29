import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import {
  SHIFT_CARD_LOGO_CLASS,
  SHIFT_CARD_META_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
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
  onSelect: (roleId: UiRole) => void
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
}: RoleCardProps) {
  const { t } = useTranslation()
  const proof = defaultSocialProofFromI18n(role.id, t)
  const emoji = ROLE_EMOJI[role.id] ?? '👤'
  const handleClick = useCallback(() => onSelect(role.id), [role.id, onSelect])

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.985 }}
        onClick={handleClick}
        aria-label={t('aria.selectRole', { label: role.title })}
        aria-pressed={isSelected}
        data-haptic="selection"
        className={cn(
          'flex w-full flex-col gap-2 rounded-lg border p-3 text-left transition-all duration-150',
          isSelected
            ? 'border-primary bg-primary/15'
            : 'border-border bg-card hover:border-foreground/20'
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn(SHIFT_CARD_LOGO_CLASS, 'text-base')} aria-hidden>
            {emoji}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className={SHIFT_CARD_TITLE_CLASS}>{role.title}</div>
            {role.description ? (
              <div className={SHIFT_CARD_SUB_CLASS}>{role.description}</div>
            ) : null}
          </div>

          <div
            className={cn(
              'grid h-7 w-7 shrink-0 place-items-center rounded-sm border',
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
          <div className="flex items-center gap-1">
            <span
              className={cn(
                SHIFT_CARD_META_CLASS,
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
