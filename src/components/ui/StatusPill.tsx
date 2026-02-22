import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { Flame } from 'lucide-react'

export type KnownShiftStatus = 'pending' | 'processing' | 'accepted' | 'rejected'

export type ShiftStatus = KnownShiftStatus | (string & {}) | null | undefined

const basePill =
  'inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium leading-none border'

export const UrgentPill = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        basePill,
        'border-transparent text-primary-foreground gradient-primary shadow-sm',
        className
      )}
    >
      <Flame className="w-3 h-3 mr-1.5 shrink-0" />
      {t('activity.urgent')}
    </span>
  )
}

const getStatusLabel = (status: ShiftStatus, t: (key: string) => string): string => {
  if (!status) return ''
  if (status === 'accepted') return t('activity.statusAcceptedPill')
  if (status === 'rejected') return t('activity.statusRejectedPill')
  if (status === 'pending' || status === 'processing') return t('activity.statusPendingPill')
  return String(status)
}

const statusToClasses = (status: ShiftStatus): string => {
  switch (status) {
    case 'accepted':
      return 'border-emerald-600/20 bg-emerald-600/10 text-emerald-700'
    case 'rejected':
      return 'border-destructive/20 bg-destructive/8 text-destructive'
    case 'pending':
    case 'processing':
      return 'border-primary/20 bg-primary/8 text-primary'
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
