import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export const Input = forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
    ({ className, type = 'text', ...props }, ref) => (
        <input
            ref={ref}
            type={type}
            data-slot="input"
            className={cn(
                'flex h-11 w-full min-w-0 rounded-xl border bg-input-background px-4 py-3 text-base transition-all',
                'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
                'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
                'border-border/50 focus-visible:outline-none focus-visible:border-purple-500/50 focus-visible:ring-4 focus-visible:ring-purple-500/10',
                'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                className
            )}
            {...props}
        />
    )
)
Input.displayName = 'Input'