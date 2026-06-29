import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'
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
const DEFAULT_INPUT_CLASS = cn(
  INPUT_FIELD_BASE_CLASS,
  'flex px-3 py-3 text-sm transition-all',
  'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
  INPUT_FIELD_INTERACTIVE_CLASS,
  'selection:bg-primary selection:text-primary-foreground',
  'border-border/50 focus-visible:ring-offset-0',
  'dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0',
  `${INPUT_FIELD_DISABLED_CLASS} md:text-sm`,
  `${INPUT_FIELD_INVALID_CLASS} dark:aria-invalid:ring-destructive/40`
)

const INPUT_VARIANT = {
  default: DEFAULT_INPUT_CLASS,
  inline:
    'flex w-full bg-transparent border-0 outline-none px-0 py-0 text-sm placeholder:text-muted-foreground ' +
    'focus-visible:ring-0 focus-visible:outline-none disabled:opacity-60',
  /**
   * Error — те же геометрия и шрифты, но красный border + ring постоянно
   * (не зависит от `aria-invalid`). Удобно когда ошибку держит внешний state.
   */
  error: cn(
    DEFAULT_INPUT_CLASS,
    'border-destructive/60 ring-1 ring-destructive/40 focus-visible:border-destructive focus-visible:ring-destructive/40'
  ),
} as const

export type InputVariant = keyof typeof INPUT_VARIANT

interface InputProps extends React.ComponentProps<'input'> {
  variant?: InputVariant
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant = 'default',
      // По умолчанию у return‑клавиши показываем «готово» (галочка/Done на iOS).
      // Любое поле может переопределить (`search`, `next`, `go` и т.д.).
      enterKeyHint = 'done',
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)
      // Enter на однострочном поле прячет клавиатуру, если потребитель не
      // перехватил событие (например, для submit формы или выбора подсказки).
      if (event.key === 'Enter' && !event.defaultPrevented) {
        event.currentTarget.blur()
      }
    }

    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        data-variant={variant}
        enterKeyHint={enterKeyHint}
        aria-invalid={variant === 'error' ? true : props['aria-invalid']}
        className={cn(INPUT_VARIANT[variant], className)}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
