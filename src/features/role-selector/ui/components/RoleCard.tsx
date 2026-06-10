import { memo, useCallback, createElement } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import {
  SHIFT_CARD_LOGO_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'
import { getRoleIcon, ICON_MD_CLASS } from '@/shared/constants/role-icons'
import type { UiRole, RoleOption } from '@/shared/types/roles.types'

interface RoleCardProps {
  role: RoleOption
  isSelected: boolean
  onSelect: (roleId: UiRole) => void
}

function roleHighlightFromI18n(
  roleId: UiRole,
  translate: (key: string) => string
): string | undefined {
  const key = `roles.highlights.${roleId}`
  const text = translate(key)
  return text !== key ? text : undefined
}

export const RoleCard = memo(function RoleCard({ role, isSelected, onSelect }: RoleCardProps) {
  const { t } = useTranslation()
  const highlight = roleHighlightFromI18n(role.id, t)
  const handleClick = useCallback(() => onSelect(role.id), [role.id, onSelect])

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={handleClick}
      aria-label={t('aria.selectRole', { label: role.title })}
      aria-pressed={isSelected}
      data-haptic="selection"
      className={cn(
        'relative flex w-full gap-3 rounded-lg border p-4 text-left transition-all duration-150',
        isSelected ? 'border-primary bg-card' : 'border-border bg-card hover:border-foreground/20'
      )}
    >
      {isSelected ? (
        <div
          className="border-primary bg-primary text-primary-foreground absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-sm border"
          aria-hidden
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </div>
      ) : null}

      <div className={cn(SHIFT_CARD_LOGO_CLASS, 'h-11 w-11 rounded-lg')} aria-hidden>
        {createElement(getRoleIcon(role.id), { className: ICON_MD_CLASS })}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 pr-8">
        <div className={cn(SHIFT_CARD_TITLE_CLASS, 'text-base')}>{role.title}</div>
        {role.description ? (
          <div className={cn(SHIFT_CARD_SUB_CLASS, 'whitespace-normal')}>{role.description}</div>
        ) : null}
        {highlight ? (
          <div className={cn(SHIFT_CARD_SUB_CLASS, 'whitespace-normal')}>{highlight}</div>
        ) : null}
      </div>
    </motion.button>
  )
})
