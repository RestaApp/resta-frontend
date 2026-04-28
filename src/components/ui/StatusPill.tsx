import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { ShieldCheck } from 'lucide-react'

export type KnownShiftStatus = 'pending' | 'processing' | 'accepted' | 'rejected'
export type ShiftStatus = KnownShiftStatus | (string & {}) | null | undefined

const basePill =
  'inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium leading-none border'

/** SOS — solid terracotta, экстренные смены (<3ч). Опционально: "SOS · {date}" */
export const UrgentPill = ({ date, className }: { date?: string; className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold leading-none tracking-widest uppercase bg-primary text-white',
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
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none tracking-wider border bg-success/10 text-success border-success/30',
      className
    )}
  >
    <ShieldCheck className="w-3 h-3 shrink-0" />
    VERIFIED
  </span>
)

/** ESCROW — outline green, критический сигнал доверия */
export const EscrowBadge = ({
  amount,
  currency,
  className,
}: {
  amount?: number | string
  currency?: string
  className?: string
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold leading-none tracking-wider border bg-success/8 text-success border-success/60',
      className
    )}
  >
    ESCROW
    {amount ? (
      <>
        <span className="opacity-60 mx-0.5">·</span>
        {amount}
        {currency ? ` ${currency}` : ''}
      </>
    ) : null}
  </span>
)

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
