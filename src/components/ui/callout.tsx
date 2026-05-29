import { cn } from '@/utils/cn'

/**
 * Callout — информационный блок с цветовым акцентом (shield‑баннеры,
 * предупреждения, success‑уведомления внутри страниц).
 *
 * Заменяет ad‑hoc паттерн `rounded-md border border-{tone}/30 bg-{tone}/8 px-3 py-2.5`,
 * который встречался в Onboarding/TelegramConfirm экранах.
 *
 * SRP: чистый презентационный примитив. Любое поведение (закрытие/действия) — снаружи.
 */
const TONE_CLASSES = {
  success: 'border-success/30 bg-success/10',
  warning: 'border-warning/30 bg-warning/10',
  destructive: 'border-destructive/30 bg-destructive/10',
  /** Alias to `destructive` per spec naming. */
  danger: 'border-destructive/30 bg-destructive/10',
  info: 'border-border bg-secondary',
  neutral: 'border-border bg-card',
  /**
   * DIRECT — Resta не удерживает деньги. Зелёный, но с акцентом на
   * институциональной seriousness (sub-text про комиссии).
   */
  direct: 'border-success/40 bg-success/10',
  /** PRO — фиолетовый gradient soft под фоном `--gradient-pro`. */
  pro: 'border-pro-border bg-[linear-gradient(160deg,var(--pro-soft),transparent)]',
} as const

export type CalloutTone = keyof typeof TONE_CLASSES

interface CalloutProps {
  children: React.ReactNode
  tone?: CalloutTone
  /** Иконка слева (lucide или эмодзи). */
  icon?: React.ReactNode
  className?: string
}

export const Callout = ({ children, tone = 'info', icon, className }: CalloutProps) => (
  <div role="note" className={cn('rounded-xl border px-3 py-2.5', TONE_CLASSES[tone], className)}>
    <div className="flex items-start gap-2">
      {icon ? (
        <span aria-hidden className="shrink-0 mt-0.5">
          {icon}
        </span>
      ) : null}
      <div className="flex-1 text-xs leading-snug text-muted-foreground">{children}</div>
    </div>
  </div>
)
