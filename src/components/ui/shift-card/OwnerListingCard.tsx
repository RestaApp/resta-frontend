import type { ReactNode } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { formatOwnerShiftScheduleLine, getOwnerShiftTitle } from '@/shared/shifts/ownerShiftDisplay'
import { Button } from '@/components/ui/button'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'

interface OwnerListingCardProps {
  listing: VacancyApiItem
  getEmployeePositionLabel: (value: string) => string
  getSpecializationLabel: (value: string) => string
  action?: ReactNode
  className?: string
}

const OwnerListingCard = ({
  listing,
  getEmployeePositionLabel,
  getSpecializationLabel,
  action,
  className,
}: OwnerListingCardProps) => {
  const positionLabel = getEmployeePositionLabel(listing.position ?? '')
  const specializationLabel = listing.specialization
    ? getSpecializationLabel(listing.specialization)
    : listing.specializations?.[0]
      ? getSpecializationLabel(listing.specializations[0])
      : null
  const listingTitle = getOwnerShiftTitle(listing, positionLabel, specializationLabel)
  const schedule = formatOwnerShiftScheduleLine(listing.start_time, listing.end_time)

  return (
    <div className={cn(SHIFT_CARD_CLASS, 'ui-density-stack', className)}>
      <div>
        <p className={SHIFT_CARD_TITLE_CLASS}>{listingTitle}</p>
        {schedule ? <p className={SHIFT_CARD_SUB_CLASS}>{schedule}</p> : null}
      </div>
      {action}
    </div>
  )
}

interface OwnerListingCardWithInviteProps extends Omit<OwnerListingCardProps, 'action'> {
  inviteLabel: string
  invitingShiftId: number | null
  onInvite: (vacancy: VacancyApiItem) => void
}

export const OwnerListingCardWithInvite = ({
  listing,
  inviteLabel,
  invitingShiftId,
  onInvite,
  getEmployeePositionLabel,
  getSpecializationLabel,
}: OwnerListingCardWithInviteProps) => (
  <OwnerListingCard
    listing={listing}
    getEmployeePositionLabel={getEmployeePositionLabel}
    getSpecializationLabel={getSpecializationLabel}
    action={
      <Button
        type="button"
        variant="gradient"
        size="md"
        className="w-full"
        loading={invitingShiftId === listing.id}
        onClick={() => onInvite(listing)}
      >
        {inviteLabel}
      </Button>
    }
  />
)
