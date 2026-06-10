import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import {
  INPUT_FIELD_BASE_CLASS,
  INPUT_FIELD_DISABLED_CLASS,
  INPUT_FIELD_INTERACTIVE_CLASS,
  INPUT_FIELD_INVALID_CLASS,
} from '@/components/ui/ui-patterns'

interface SelectTriggerProps {
  isOpen: boolean
  disabled: boolean
  error?: string
  displayPlaceholder: string
  displayValue: string
  value: string
  listboxId: string
  onToggle: () => void
}

export const SelectTrigger = ({
  isOpen,
  disabled,
  error,
  displayPlaceholder,
  displayValue,
  value,
  listboxId,
  onToggle,
}: SelectTriggerProps) => {
  return (
    <button
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      aria-controls={listboxId}
      aria-expanded={isOpen}
      onClick={onToggle}
      disabled={disabled}
      data-haptic="light"
      aria-invalid={!!error}
      className={cn(
        INPUT_FIELD_BASE_CLASS,
        INPUT_FIELD_INTERACTIVE_CLASS,
        INPUT_FIELD_INVALID_CLASS,
        INPUT_FIELD_DISABLED_CLASS,
        'flex h-11 items-center justify-between px-4 py-3 text-base transition-all',
        'border-border/50',
        isOpen && 'border-primary',
        !value && 'text-muted-foreground'
      )}
    >
      <span className="truncate text-left">{displayValue || displayPlaceholder}</span>
      <ChevronDown
        className={cn(
          'ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  )
}
