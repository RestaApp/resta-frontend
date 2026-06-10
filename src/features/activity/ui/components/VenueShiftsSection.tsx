import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/shared/utils/cn'
import { PersonalShiftCard } from '@/features/activity/ui/components/PersonalShiftCard'
import { groupOwnerByListingStatus } from '@/features/activity/model/utils/groupOwnerByListingStatus'
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
}: VenueShiftsSectionProps) => {
  const { t } = useTranslation()
  const groups = useMemo(() => groupOwnerByListingStatus(items), [items])

  return (
    <section className="ui-density-stack">
      {groups.map(({ status, label, items: groupItems }) => (
        <div key={status} className="ui-density-stack">
          <p className={cn(PROFILE_SECTION_LABEL_CLASS, 'mb-0')}>{t(label)}</p>
          <div className="ui-density-stack">
            {groupItems.map(shift => (
              <PersonalShiftCard
                key={shift.id}
                shift={shift}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
