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

interface SelectableTagButtonProps {
  value: string
  label: string
  isSelected: boolean
  onClick: (value: string) => void
  ariaLabel?: string
  disabled?: boolean
}

export const SelectableTagButton = memo(function SelectableTagButton({
  value,
  label,
  isSelected,
  onClick,
  ariaLabel,
  disabled = false,
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
        isSelected ? TAG_ACTIVE_CLASS : TAG_INACTIVE_CLASS
      )}
      aria-pressed={isSelected}
      aria-label={ariaLabel || t('aria.selectType', { label })}
      aria-disabled={disabled}
    >
      {label}
    </motion.button>
  )
})
