import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export const Textarea = forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        'flex min-h-[100px] w-full rounded-xl border bg-input-background px-4 py-3 text-base text-foreground caret-foreground transition-all',
        'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
        'border-border/50 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
        className
      )}
      {...props}
    />
  )
)

Textarea.displayName = 'Textarea'
