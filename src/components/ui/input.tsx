import * as React from 'react'
import { cn } from '@/utils/cn'
import { memo } from 'react'

export const Input = memo(function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-11 w-full min-w-0 rounded-xl border px-4 py-3 text-base bg-input-background transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'border-border/50 focus-visible:border-purple-500/50 focus-visible:ring-purple-500/10 focus-visible:ring-4',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                className,
            )}
            {...props}
        />
    )
})


