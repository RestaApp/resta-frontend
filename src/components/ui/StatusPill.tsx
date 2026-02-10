import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { Flame } from 'lucide-react'

export type KnownShiftStatus = 'pending' | 'processing' | 'accepted' | 'rejected'

export type ShiftStatus = KnownShiftStatus | (string & {}) | null | undefined

const basePill =
    'inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold leading-none border'

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
            <Flame className="w-3 h-3 mr-1" />
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
            return 'border-[color:var(--blue-cyber)]/30 bg-[color:var(--blue-cyber)]/10 text-[color:var(--blue-cyber)]'
        case 'rejected':
            return 'border-destructive/25 bg-destructive/10 text-destructive'
        case 'pending':
        case 'processing':
            return 'border-primary/20 bg-primary/10 text-primary'
        default:
            return 'border-border bg-secondary/60 text-muted-foreground'
    }
}

export const StatusPill = ({
    status,
    className,
}: {
    status: ShiftStatus
    className?: string
}) => {
    const { t } = useTranslation()
    const label = getStatusLabel(status, t)
    if (!label) return null
    return <span className={cn(basePill, statusToClasses(status), className)}>{label}</span>
}
