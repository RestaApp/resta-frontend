import { cn } from '@/utils/cn'
import { Flame } from 'lucide-react'

export type ShiftStatus =
    | 'pending'
    | 'processing'
    | 'accepted'
    | 'rejected'
    | string
    | null
    | undefined

const basePill =
    'inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold leading-none border'

export const UrgentPill = ({ className }: { className?: string }) => {
    // Срочно = бренд, чтобы не конфликтовало с rejected (destructive)
    return (
        <span
            className={cn(
                basePill,
                'border-transparent text-primary-foreground gradient-primary shadow-sm',
                className
            )}
        >
            <Flame className="w-3 h-3 mr-1" />
            Срочно
        </span>
    )
}

const statusToLabel = (status: ShiftStatus): string => {
    if (!status) return ''
    if (status === 'accepted') return 'Подтверждена'
    if (status === 'rejected') return 'Отклонена'
    if (status === 'pending' || status === 'processing') return 'В обработке'
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
    const label = statusToLabel(status)
    if (!label) return null
    return <span className={cn(basePill, statusToClasses(status), className)}>{label}</span>
}
