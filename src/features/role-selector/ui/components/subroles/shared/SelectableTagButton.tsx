/**
 * Переиспользуемый компонент кнопки-тега для выбора (специализации, типы ресторанов, категории товаров)
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'

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
        'px-4 py-2 rounded-full text-sm font-medium transition-all border',
        disabled && 'opacity-50 cursor-not-allowed',
        isSelected
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20 border-transparent'
          : 'border-primary/20 bg-primary/10 text-foreground hover:bg-primary/15 hover:border-primary/30'
      )}
      aria-pressed={isSelected}
      aria-label={ariaLabel || t('aria.selectType', { label })}
      aria-disabled={disabled}
    >
      {label}
    </motion.button>
  )
})
