import { memo, useCallback } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export const Switch = memo(function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  ariaLabel,
}: SwitchProps) {
  const toggle = useCallback(() => {
    if (disabled) return
    onCheckedChange(!checked)
  }, [checked, disabled, onCheckedChange])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        toggle()
      }
    },
    [disabled, toggle]
  )

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? 'Switch'}
      disabled={disabled}
      onClick={toggle}
      onKeyDown={onKeyDown}
      className={cn(
        'relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        checked ? 'focus-visible:ring-primary' : 'focus-visible:ring-muted-foreground/50',
        checked ? 'gradient-primary' : 'bg-[var(--switch-background)]',
        className
      )}
    >
      <motion.div
        className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md"
        animate={{ x: checked ? 28 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
})
