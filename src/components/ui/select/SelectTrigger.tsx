import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ChangeEvent, KeyboardEvent, RefObject } from 'react'
import {
  INPUT_FIELD_BASE_CLASS,
  INPUT_FIELD_DISABLED_CLASS,
  INPUT_FIELD_INTERACTIVE_CLASS,
  INPUT_FIELD_INVALID_CLASS,
} from '@/components/ui/ui-patterns'

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
            INPUT_FIELD_BASE_CLASS,
            INPUT_FIELD_INTERACTIVE_CLASS,
            INPUT_FIELD_INVALID_CLASS,
            INPUT_FIELD_DISABLED_CLASS,
            'flex h-11 items-center px-4 py-3 pr-10 text-base transition-all',
            'border-border/50',
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
        INPUT_FIELD_BASE_CLASS,
        INPUT_FIELD_INTERACTIVE_CLASS,
        INPUT_FIELD_INVALID_CLASS,
        INPUT_FIELD_DISABLED_CLASS,
        'flex h-11 items-center justify-between px-4 py-3 text-base transition-all',
        'border-border/50',
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
