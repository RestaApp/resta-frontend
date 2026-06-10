import { OwnerShiftCardsList } from '@/features/activity/ui/components/OwnerShiftCardsList'
import { groupOwnerByListingStatus } from '@/shared/shifts/groupOwnerByListingStatus'
import type { VacancyApiItem } from '@/services/api/shiftsApi'

interface VenueShiftsSectionProps {
  items: VacancyApiItem[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  isDeleting: boolean
}

export const VenueShiftsSection = ({
  items,
  onEdit,
  onDelete,
  isDeleting,
}: VenueShiftsSectionProps) => (
  <section className="ui-density-stack">
    <OwnerShiftCardsList
      items={items}
      onEdit={onEdit}
      onDelete={onDelete}
      isDeleting={isDeleting}
      groupBy={groupOwnerByListingStatus}
    />
  </section>
)
