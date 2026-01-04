import { memo } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

/**
 * Универсальный Switch компонент в стиле Resta
 * Использует градиент Resta (фиолетово-розовый) когда включен
 */
export const Switch = memo(function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  ariaLabel,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        checked
          ? 'focus:ring-purple-500/50'
          : 'focus:ring-muted-foreground/50',
        className
      )}
      style={{
        background: checked
          ? 'var(--gradient-primary)'
          : 'var(--switch-background)',
      }}
    >
      <motion.div
        className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md"
        animate={{
          x: checked ? 28 : 2,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      />
    </button>
  )
})

