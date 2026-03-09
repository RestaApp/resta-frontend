import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface FormFieldProps {
  label?: string
  htmlFor?: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  labelClassName?: string
  messageClassName?: string
  children: ReactNode
}

export const FormField = ({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  className,
  labelClassName,
  messageClassName,
  children,
}: FormFieldProps) => {
  const errorText = error?.trim() ? error : undefined
  const hintText = !errorText ? hint?.trim() : undefined
  const hasMessage = Boolean(errorText || hintText)

  return (
    <div className={className}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className={cn('mb-2 block text-sm font-medium text-muted-foreground', labelClassName)}
        >
          {label}
          {required ? ' *' : ''}
        </label>
      ) : null}

      {children}

      {hasMessage ? (
        <p
          className={cn(
            'mt-1 text-xs',
            errorText ? 'text-destructive' : 'text-muted-foreground',
            messageClassName
          )}
          role={errorText ? 'alert' : undefined}
        >
          {errorText ?? hintText}
        </p>
      ) : null}
    </div>
  )
}
