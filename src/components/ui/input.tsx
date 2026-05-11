import { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import {
  INPUT_FIELD_BASE_CLASS,
  INPUT_FIELD_DISABLED_CLASS,
  INPUT_FIELD_INTERACTIVE_CLASS,
  INPUT_FIELD_INVALID_CLASS,
} from './ui-patterns'

/**
 * Варианты Input:
 *  - default — стандартное поле с border/ring/padding и focus‑state.
 *  - inline  — без рамки/тени/паддинга. Для случаев, когда Input визуально
 *              «сидит внутри» родительского контейнера (chip‑группы, контейнеры
 *              с иконкой/кнопкой). Заменяет ad‑hoc `!border-0 !ring-0 !shadow-none`
 *              хаки.
 */
const INPUT_VARIANT = {
  default: cn(
    INPUT_FIELD_BASE_CLASS,
    'flex px-4 py-3 text-base transition-all',
    'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
    INPUT_FIELD_INTERACTIVE_CLASS,
    'selection:bg-primary selection:text-primary-foreground',
    'border-border/50 focus-visible:ring-offset-0',
    'dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0',
    `${INPUT_FIELD_DISABLED_CLASS} md:text-sm`,
    `${INPUT_FIELD_INVALID_CLASS} dark:aria-invalid:ring-destructive/40`
  ),
  inline:
    'flex w-full bg-transparent border-0 outline-none px-0 py-0 text-sm placeholder:text-muted-foreground ' +
    'focus-visible:ring-0 focus-visible:outline-none disabled:opacity-60',
} as const

export type InputVariant = keyof typeof INPUT_VARIANT

interface InputProps extends React.ComponentProps<'input'> {
  variant?: InputVariant
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', variant = 'default', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      data-variant={variant}
      className={cn(INPUT_VARIANT[variant], className)}
      {...props}
    />
  )
)
Input.displayName = 'Input'
