import type { ReactNode } from 'react'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/shared/utils/cn'

interface FormFieldProps {
  label?: string
  htmlFor?: string
  hint?: string
  /** `label` — справа от заголовка; `below` — под полем (по умолчанию). */
  hintPlacement?: 'label' | 'below'
  error?: string
  required?: boolean
  className?: string
  labelClassName?: string
  messageClassName?: string
  /** Доп. элемент справа от заголовка — например «?»-хинт. */
  labelAdornment?: ReactNode
  children: ReactNode
}

export const FormField = ({
  label,
  htmlFor,
  hint,
  hintPlacement = 'below',
  error,
  required = false,
  className,
  labelClassName,
  messageClassName,
  labelAdornment,
  children,
}: FormFieldProps) => {
  const errorText = error?.trim() ? error : undefined
  const hintText = !errorText ? hint?.trim() : undefined
  const labelHintText = hintPlacement === 'label' ? hintText : undefined
  const belowHintText = hintPlacement === 'below' ? hintText : undefined
  const hasMessage = Boolean(errorText || belowHintText)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <label htmlFor={htmlFor} className={cn(PROFILE_SECTION_LABEL_CLASS, labelClassName)}>
              {label}
              {required ? <span className="ml-0.5 text-destructive">*</span> : null}
            </label>
            {labelAdornment}
          </span>
          {labelHintText ? (
            <span className="shrink-0 text-xs text-muted-foreground">{labelHintText}</span>
          ) : null}
        </div>
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
          {errorText ?? belowHintText}
        </p>
      ) : null}
    </div>
  )
}
