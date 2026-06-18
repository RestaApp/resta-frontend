import type { ReactNode } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { formatOwnerShiftScheduleLine, getOwnerShiftTitle } from '@/shared/shifts/ownerShiftDisplay'
import { Button } from '@/components/ui/button'
import { ShiftCardPriceBlock } from '@/components/ui/shift-card/ShiftCardPriceBlock'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_ROW_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'

const resolveListingPay = (listing: VacancyApiItem): number | null => {
  const raw = listing.payment ?? listing.hourly_rate
  if (raw == null) return null
  const amount = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

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
  const hasCustomTitle = Boolean(listing.title?.trim())
  const roleLine = specializationLabel
    ? `${positionLabel} · ${specializationLabel}`
    : positionLabel
  const subtitle = schedule || (hasCustomTitle ? roleLine : null)
  const payAmount = resolveListingPay(listing)

  return (
    <div className={cn(SHIFT_CARD_CLASS, 'ui-density-stack', className)}>
      <div className={SHIFT_CARD_ROW_CLASS}>
        <div className="min-w-0 flex-1">
          <p className={SHIFT_CARD_TITLE_CLASS}>{listingTitle}</p>
          {subtitle ? <p className={SHIFT_CARD_SUB_CLASS}>{subtitle}</p> : null}
        </div>
        <ShiftCardPriceBlock amount={payAmount} />
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
