/**
 * Переиспользуемый компонент кнопки-тега для выбора (специализации, типы, категории).
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'
import {
  TAG_ACTIVE_CLASS,
  TAG_BASE_CLASS,
  TAG_DISABLED_CLASS,
  TAG_INACTIVE_CLASS,
} from '@/components/ui/ui-patterns'

type TagSize = 'md' | 'lg'

const SIZE_CLASS: Record<TagSize, string> = {
  md: '',
  lg: 'px-3 py-2 text-sm font-semibold',
}

interface SelectableTagButtonProps {
  value: string
  label: string
  icon?: LucideIcon
  isSelected: boolean
  onClick: (value: string) => void
  ariaLabel?: string
  disabled?: boolean
  size?: TagSize
}

export const SelectableTagButton = memo(function SelectableTagButton({
  value,
  label,
  icon: Icon,
  isSelected,
  onClick,
  ariaLabel,
  disabled = false,
  size = 'md',
}: SelectableTagButtonProps) {
  const { t } = useTranslation()

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.95 }}
      onClick={() => !disabled && onClick(value)}
      disabled={disabled}
      data-haptic="selection"
      className={cn(
        TAG_BASE_CLASS,
        'inline-flex items-center gap-1.5',
        SIZE_CLASS[size],
        disabled && TAG_DISABLED_CLASS,
        isSelected ? TAG_ACTIVE_CLASS : TAG_INACTIVE_CLASS
      )}
      aria-pressed={isSelected}
      aria-label={ariaLabel || t('aria.selectType', { label })}
      aria-disabled={disabled}
      title={label}
    >
      {Icon ? <Icon className={ICON_SM_CLASS} aria-hidden /> : null}
      {label}
    </motion.button>
  )
})
