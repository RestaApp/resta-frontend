import type { ReactNode } from 'react'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
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
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className={cn('block', PROFILE_SECTION_LABEL_CLASS, labelClassName)}
        >
          {label}
          {required ? ' *' : ''}
        </label>
      ) : null}

      {children}

      {hasMessage ? (
        <p
          className={cn(
            'text-xs',
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
