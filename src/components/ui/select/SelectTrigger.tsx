import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ChangeEvent, KeyboardEvent, RefObject } from 'react'

interface SelectTriggerProps {
  allowCustomValue: boolean
  isOpen: boolean
  disabled: boolean
  error?: string
  displayPlaceholder: string
  displayValue: string
  value: string
  searchQuery: string
  triggerInputRef: RefObject<HTMLInputElement | null>
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  onInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  onFocusInput: () => void
  onToggle: () => void
}

export const SelectTrigger = ({
  allowCustomValue,
  isOpen,
  disabled,
  error,
  displayPlaceholder,
  displayValue,
  value,
  searchQuery,
  triggerInputRef,
  onInputChange,
  onInputKeyDown,
  onFocusInput,
  onToggle,
}: SelectTriggerProps) => {
  if (allowCustomValue && isOpen) {
    return (
      <div className="relative">
        <input
          ref={triggerInputRef}
          type="text"
          value={searchQuery}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
          onFocus={onFocusInput}
          disabled={disabled}
          aria-invalid={!!error}
          placeholder={displayPlaceholder}
          className={cn(
            'flex h-11 w-full min-w-0 items-center rounded-xl border bg-input-background px-4 py-3 pr-10 text-base text-foreground caret-foreground transition-all',
            'placeholder:text-muted-foreground',
            'border-border/50 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
            'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            isOpen && 'border-primary ring-2 ring-primary/20'
          )}
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 text-muted-foreground transition-transform rotate-180 pointer-events-none" />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-invalid={!!error}
      className={cn(
        'flex h-11 w-full min-w-0 items-center justify-between rounded-xl border bg-input-background px-4 py-3 text-base transition-all',
        'placeholder:text-muted-foreground',
        'border-border/50 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
        'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        isOpen && 'border-primary ring-2 ring-primary/20',
        !value && 'text-muted-foreground'
      )}
    >
      <span className="truncate text-left">{displayValue}</span>
      <ChevronDown
        className={cn(
          'ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  )
}
