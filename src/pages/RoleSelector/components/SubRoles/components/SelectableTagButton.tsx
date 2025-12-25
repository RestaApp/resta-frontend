/**
 * Переиспользуемый компонент кнопки-тега для выбора (специализации, типы ресторанов, категории товаров)
 */

import { memo } from 'react'
import { motion } from 'motion/react'
import type { JSX } from 'react'

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
}: SelectableTagButtonProps): JSX.Element {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onClick(value)}
            className="px-4 py-2 rounded-full border-2 transition-all text-sm font-medium"
            style={{
                background: isSelected ? 'var(--gradient-primary)' : 'transparent',
                borderColor: isSelected ? 'transparent' : '#E0E0E0',
                color: isSelected ? 'white' : 'inherit',
            }}
            aria-pressed={isSelected}
            aria-label={ariaLabel || `Выбрать: ${label}`}
        >
            {label}
        </motion.button>
    )
})



