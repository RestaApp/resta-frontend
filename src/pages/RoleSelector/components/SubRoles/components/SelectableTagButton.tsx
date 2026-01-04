/**
 * Переиспользуемый компонент кнопки-тега для выбора (специализации, типы ресторанов, категории товаров)
 */

import { memo } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'


interface SelectableTagButtonProps {
    value: string
    label: string
    isSelected: boolean
    onClick: (value: string) => void
    ariaLabel?: string
}

export const SelectableTagButton = memo(function SelectableTagButton({
    value,
    label,
    isSelected,
    onClick,
    ariaLabel,
}: SelectableTagButtonProps) {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onClick(value)}
            className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20 border-transparent'
                    : 'bg-secondary/40 text-muted-foreground hover:bg-secondary border-transparent'
            )}
            aria-pressed={isSelected}
            aria-label={ariaLabel || `Выбрать: ${label}`}
        >
            {label}
        </motion.button>
    )
})



