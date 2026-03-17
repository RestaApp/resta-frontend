import { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import {
  INPUT_FIELD_BASE_CLASS,
  INPUT_FIELD_DISABLED_CLASS,
  INPUT_FIELD_INTERACTIVE_CLASS,
  INPUT_FIELD_INVALID_CLASS,
} from './ui-patterns'

export const Input = forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        INPUT_FIELD_BASE_CLASS,
        'flex h-11 px-4 py-3 text-base transition-all',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        INPUT_FIELD_INTERACTIVE_CLASS,
        'selection:bg-primary selection:text-primary-foreground',
        'border-border/50 focus-visible:ring-offset-0',
        'dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0',
        `${INPUT_FIELD_DISABLED_CLASS} md:text-sm`,
        `${INPUT_FIELD_INVALID_CLASS} dark:aria-invalid:ring-destructive/40`,
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
