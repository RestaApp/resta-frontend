import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

export type KnownShiftStatus = 'pending' | 'processing' | 'accepted' | 'rejected'
export type ShiftStatus = KnownShiftStatus | (string & {}) | null | undefined

const basePill =
  'inline-flex items-center whitespace-nowrap rounded-sm px-2 py-1 text-xs font-mono-resta font-semibold uppercase tracking-wider leading-none border'

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
      return 'border-primary/25 bg-primary/10 text-primary'
    default:
      return 'border-border bg-secondary/50 text-muted-foreground'
  }
}

export const StatusPill = ({ status, className }: { status: ShiftStatus; className?: string }) => {
  const { t } = useTranslation()
  const label = getStatusLabel(status, t)
  if (!label) return null
  return <span className={cn(basePill, statusToClasses(status), className)}>{label}</span>
}
