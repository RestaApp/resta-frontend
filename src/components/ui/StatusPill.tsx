import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { Flame } from 'lucide-react'

export type KnownShiftStatus = 'pending' | 'processing' | 'accepted' | 'rejected'

export type ShiftStatus = KnownShiftStatus | (string & {}) | null | undefined

const basePill =
  'inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium leading-none border'

const urgentInnerPill =
  'inline-flex items-center whitespace-nowrap px-3 py-1 text-xs font-medium leading-none border-0'

export const UrgentPill = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex max-w-max rounded-full overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.14)]',
        className
      )}
    >
      {/* Градиент на прямоугольнике; скругление только у обёртки — иначе на стыке дуги и 135°-градиента видны чужие цвета */}
      <span className={cn(urgentInnerPill, 'gradient-primary text-white')}>
        <Flame className="w-3 h-3 mr-1.5 shrink-0" />
        {t('activity.urgent')}
      </span>
    </span>
  )
}

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
      return 'border-success/20 bg-success/10 text-success'
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
