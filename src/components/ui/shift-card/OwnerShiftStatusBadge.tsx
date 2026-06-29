import { Circle, Star, UserCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'
import {
  getOwnerListingStatusLabel,
  type OwnerShiftListingStatus,
} from '@/shared/shifts/ownerShiftDisplay'

// `urgent` рисуется единым SOS-бейджем в ShiftCard, сюда не попадает.
type OwnerShiftBadgeStatus = Exclude<OwnerShiftListingStatus, 'urgent'>

interface OwnerShiftStatusBadgeProps {
  status: OwnerShiftBadgeStatus
}

const STATUS_VARIANT: Record<OwnerShiftBadgeStatus, 'ok' | 'accepted' | 'default'> = {
  open: 'ok',
  filled: 'accepted',
  closed: 'default',
}

const STATUS_ICON: Record<OwnerShiftBadgeStatus, typeof Circle> = {
  open: Circle,
  filled: UserCheck,
  closed: Star,
}

export const OwnerShiftStatusBadge = ({ status }: OwnerShiftStatusBadgeProps) => {
  const { t } = useTranslation()
  const label = getOwnerListingStatusLabel(status, t)
  const Icon = STATUS_ICON[status]

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
