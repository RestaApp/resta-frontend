import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { ShieldCheck } from 'lucide-react'

export type KnownShiftStatus = 'pending' | 'processing' | 'accepted' | 'rejected'
export type ShiftStatus = KnownShiftStatus | (string & {}) | null | undefined

const basePill =
  'inline-flex items-center whitespace-nowrap rounded-[6px] px-2 py-1 text-micro font-mono-resta font-semibold uppercase tracking-wider leading-none border'

/** SOS — solid terracotta, экстренные смены (<3ч). Опционально: "SOS · {date}" */
export const UrgentPill = ({ date, className }: { date?: string; className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-micro font-bold leading-none tracking-widest uppercase bg-primary text-white',
      className
    )}
  >
    SOS
    {date ? (
      <>
        <span className="opacity-60 mx-0.5">·</span>
        {date}
      </>
    ) : null}
  </span>
)

/** VERIFIED — subtle green outline, проверенное заведение */
export const VerifiedBadge = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-[5px] px-1.5 py-0.5 text-micro font-semibold leading-none tracking-wider border bg-success/10 text-success border-success/30',
      className
    )}
  >
    <ShieldCheck className="w-3 h-3 shrink-0" />
    VERIFIED
  </span>
)

/**
 * DIRECT PAY — оплата напрямую, без комиссии Resta.
 * См. Resta Wireframes E04, E07, R03 — этот бейдж заменил ESCROW.
 */
export const DirectPayBadge = ({
  amount,
  currency,
  short,
  className,
}: {
  amount?: number | string
  currency?: string
  short?: boolean
  className?: string
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-micro font-bold leading-none tracking-wider border bg-success/10 text-success border-success/40',
      className
    )}
  >
    {short ? 'DIRECT' : 'DIRECT PAY'}
    {amount ? (
      <>
        <span className="opacity-60 mx-0.5">·</span>
        {amount}
        {currency ? ` ${currency}` : ''}
      </>
    ) : null}
  </span>
)

/**
 * @deprecated Resta больше не держит деньги — используйте `DirectPayBadge`.
 * Алиас оставлен для обратной совместимости со старыми вызовами.
 */
export const EscrowBadge = DirectPayBadge

const getStatusLabel = (status: ShiftStatus, t: (key: string) => string): string => {
  if (!status) return ''
  if (status === 'accepted') return t('activity.statusAcceptedPill')
  if (status === 'rejected') return t('activity.statusRejectedPill')
  if (status === 'pending' || status === 'processing') return t('activity.statusPendingPill')
  const raw = String(status)
  const normalized = raw.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const statusToClasses = (status: ShiftStatus): string => {
  switch (status) {
    case 'accepted':
      return 'border-success/25 bg-success/10 text-success'
    case 'rejected':
      return 'border-destructive/25 bg-destructive/8 text-destructive'
    case 'pending':
    case 'processing':
      return 'border-primary/25 bg-primary/8 text-primary'
    default:
      return 'border-border bg-muted/50 text-muted-foreground'
  }
}

export const StatusPill = ({ status, className }: { status: ShiftStatus; className?: string }) => {
  const { t } = useTranslation()
  const label = getStatusLabel(status, t)
  if (!label) return null
  return <span className={cn(basePill, statusToClasses(status), className)}>{label}</span>
}
