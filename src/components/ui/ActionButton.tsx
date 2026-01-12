import React from 'react'

interface ActionButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  active?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export const ActionButton = ({
  children,
  isLoading = false,
  active = false,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: ActionButtonProps) => {
  const base = 'px-6 py-2 rounded-xl transition-all flex-shrink-0'

  const stateClass = isLoading
    ? 'bg-secondary text-foreground/70 cursor-wait'
    : active
      ? 'bg-secondary text-foreground/70 hover:bg-destructive/10 hover:text-destructive border border-destructive/20'
      : 'gradient-primary text-white hover:opacity-90 shadow-md'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${base} ${stateClass} ${className}`.trim()}
    >
      {children}
    </button>
  )
}

export default ActionButton

