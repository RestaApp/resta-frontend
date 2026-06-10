import { Circle, Clock, Star, UserCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'
import type { OwnerShiftListingStatus } from '@/shared/shifts/ownerShiftDisplay'

interface OwnerShiftStatusBadgeProps {
  status: OwnerShiftListingStatus
}

const STATUS_VARIANT: Record<OwnerShiftListingStatus, 'ok' | 'accepted' | 'warning' | 'default'> = {
  open: 'ok',
  filled: 'accepted',
  urgent: 'warning',
  closed: 'default',
}

export const OwnerShiftStatusBadge = ({ status }: OwnerShiftStatusBadgeProps) => {
  const { t } = useTranslation()

  const label =
    status === 'urgent'
      ? t('shift.urgentBadge')
      : status === 'closed'
        ? t('shift.statusClosed')
        : status === 'filled'
          ? t('shift.statusFilled')
          : t('shift.statusOpen')

  const Icon =
    status === 'urgent'
      ? Clock
      : status === 'closed'
        ? Star
        : status === 'filled'
          ? UserCheck
          : Circle

  return (
    <Badge variant={STATUS_VARIANT[status]} className="rounded-full px-2">
      <Icon
        className={ICON_SM_CLASS}
        aria-hidden
        fill={status === 'open' ? 'currentColor' : 'none'}
      />
      {label}
    </Badge>
  )
}
