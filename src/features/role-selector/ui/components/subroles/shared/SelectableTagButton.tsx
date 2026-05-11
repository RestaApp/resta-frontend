/**
 * Переиспользуемый компонент кнопки-тега для выбора (специализации, типы ресторанов, категории товаров)
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import {
  TAG_ACTIVE_CLASS,
  TAG_BASE_CLASS,
  TAG_DISABLED_CLASS,
  TAG_INACTIVE_CLASS,
} from '@/components/ui/ui-patterns'

type TagTone = 'primary' | 'employee' | 'restaurant' | 'supplier'

const TONE_ACTIVE: Record<TagTone, string> = {
  primary: TAG_ACTIVE_CLASS,
  employee: 'border-transparent bg-role-employee text-white shadow-sm',
  restaurant: 'border-transparent bg-role-restaurant text-white shadow-sm',
  supplier: 'border-transparent bg-role-supplier text-white shadow-sm',
}

interface SelectableTagButtonProps {
  value: string
  label: string
  isSelected: boolean
  onClick: (value: string) => void
  ariaLabel?: string
  disabled?: boolean
  /** Цвет активного состояния — по роли. */
  tone?: TagTone
}

export const SelectableTagButton = memo(function SelectableTagButton({
  value,
  label,
  isSelected,
  onClick,
  ariaLabel,
  disabled = false,
  tone = 'primary',
}: SelectableTagButtonProps) {
  const { t } = useTranslation()
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.95 }}
      onClick={() => !disabled && onClick(value)}
      disabled={disabled}
      className={cn(
        TAG_BASE_CLASS,
        disabled && TAG_DISABLED_CLASS,
        isSelected ? TONE_ACTIVE[tone] : TAG_INACTIVE_CLASS
      )}
      aria-pressed={isSelected}
      aria-label={ariaLabel || t('aria.selectType', { label })}
      aria-disabled={disabled}
      title={label}
    >
      {label}
    </motion.button>
  )
})
