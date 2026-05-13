import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CheckCircle2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Callout } from '@/components/ui/callout'
import { Loader } from '@/components/ui/loader'

/**
 * Общесистемные состояния страниц (BOARD-10 в Resta Production).
 *
 * Все компоненты — чистая презентация. Никакой бизнес-логики, никакой работы
 * с RTK Query или роутингом. CTA-обработчики приходят сверху как props.
 *
 * Используются как `state`-слот внутри `PageShell` либо как inline-плашка
 * посреди списка/формы.
 */

// ─────────────────────────────────────────────────────────────────────────────
// LoadingState

interface LoadingStateProps {
  /** Подпись под лоадером, например: «Подключаемся к Telegram…». */
  message?: string
  className?: string
}

export const LoadingState = ({ message, className }: LoadingStateProps) => {
  const { t } = useTranslation()
  return (
    <div
      className={`flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 ${className ?? ''}`}
      role="status"
      aria-live="polite"
    >
      <Loader size="lg" />
      <p className="text-body-md text-muted-foreground text-center">
        {message ?? t('common.loading', { defaultValue: 'Загружаем…' })}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ErrorState

interface ErrorStateProps {
  /** Главный текст: что произошло. */
  title?: string
  /** Деталь — например, локализованное сообщение из API. */
  description?: string
  /** Обработчик «Повторить». Если не задан — кнопка не показывается. */
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export const ErrorState = ({
  title,
  description,
  onRetry,
  retryLabel,
  className,
}: ErrorStateProps) => {
  const { t } = useTranslation()
  return (
    <div
      className={`flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center ${className ?? ''}`}
      role="alert"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" aria-hidden />
      </div>
      <p className="text-title-sm font-semibold text-foreground">
        {title ?? t('common.error', { defaultValue: 'Не удалось загрузить' })}
      </p>
      {description ? (
        <p className="max-w-[300px] text-body-md text-muted-foreground">{description}</p>
      ) : null}
      {onRetry ? (
        <Button variant="secondary" size="md" onClick={onRetry} className="mt-2">
          {retryLabel ?? t('common.retry', { defaultValue: 'Повторить' })}
        </Button>
      ) : null}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SuccessState

interface SuccessStateProps {
  /** Заголовок: «Профиль готов», «Отклик отправлен». */
  title: string
  /** Подзаголовок: что будет дальше. */
  description?: string
  /** Основной CTA («Найти смены», «Посмотреть смену»). */
  primaryAction?: ReactNode
  /** Вторичный CTA («+ Ещё одну»). */
  secondaryAction?: ReactNode
  className?: string
}

export const SuccessState = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: SuccessStateProps) => (
  <div
    className={`flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center ${className ?? ''}`}
    role="status"
    aria-live="polite"
  >
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
      <CheckCircle2 className="h-8 w-8 text-success" aria-hidden />
    </div>
    <p className="text-title-md font-extrabold text-foreground">{title}</p>
    {description ? (
      <p className="max-w-[320px] text-body-md text-muted-foreground">{description}</p>
    ) : null}
    {primaryAction || secondaryAction ? (
      <div className="mt-2 flex flex-col items-stretch gap-2 w-full max-w-[280px]">
        {primaryAction}
        {secondaryAction}
      </div>
    ) : null}
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// AccessLockedState
//
// BOARD-09 в Resta Production: «Контакты заблокированы», «Нужна PRO-подписка».
// Универсальный — принимает reason, описание и CTA. Конкретные обёртки
// (ContactsLockedState и пр.) — в feature-папках, чтобы не тащить домен в shared.

interface AccessLockedStateProps {
  /** Причина блокировки крупно: «Контакты заблокированы», «Доступно по PRO». */
  title: string
  /** Описание правил доступа. */
  description?: string
  /** CTA на разблокировку (PRO, выбор кандидата и т.п.). */
  cta?: ReactNode
  /** Заменить иконку (`<Lock />` по умолчанию). */
  icon?: ReactNode
  className?: string
}

export const AccessLockedState = ({
  title,
  description,
  cta,
  icon,
  className,
}: AccessLockedStateProps) => (
  <div
    className={`flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center ${className ?? ''}`}
    role="region"
    aria-label={title}
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-subtle)]">
      {icon ?? <Lock className="h-6 w-6 text-muted-foreground" aria-hidden />}
    </div>
    <p className="text-title-sm font-semibold text-foreground">{title}</p>
    {description ? (
      <p className="max-w-[320px] text-body-md text-muted-foreground">{description}</p>
    ) : null}
    {cta ? <div className="mt-1 w-full max-w-[280px]">{cta}</div> : null}
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// DirectPaymentInfo
//
// Информационный блок «Resta не удерживает деньги. Оплата напрямую…».
// Используется на E04, R00, R02 шаг 3, R10 и т.д. Чтобы не плодить одинаковые
// Callout-плашки в каждой странице — фиксируем копи + tone в одном месте.

interface DirectPaymentInfoProps {
  /** Заменить основной текст, если нужен более конкретный вариант. */
  title?: ReactNode
  /** Дополнительный пояснительный текст. */
  description?: ReactNode
  className?: string
}

export const DirectPaymentInfo = ({ title, description, className }: DirectPaymentInfoProps) => {
  const { t } = useTranslation()
  return (
    <Callout tone="direct" className={className}>
      <p className="text-meta font-semibold uppercase tracking-wider text-success">
        {t('payments.directBadge', { defaultValue: 'DIRECT' })}
      </p>
      <p className="mt-1 text-body-md leading-snug text-foreground">
        {title ??
          t('payments.directTitle', {
            defaultValue: 'Resta не удерживает деньги — оплата напрямую между сторонами.',
          })}
      </p>
      {description ? <p className="mt-1 text-meta text-muted-foreground">{description}</p> : null}
    </Callout>
  )
}
