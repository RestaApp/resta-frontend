import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import { PersonalShiftCard } from '@/features/activity/ui/components/PersonalShiftCard'
import type { VacancyApiItem } from '@/services/api/shiftsApi'

interface OwnerShiftGroup<TStatus extends string = string> {
  status: TStatus
  label: string
  items: VacancyApiItem[]
}

interface OwnerShiftCardsListProps {
  items: VacancyApiItem[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  isDeleting: boolean
  groupBy?: (items: VacancyApiItem[]) => OwnerShiftGroup[]
}

export const OwnerShiftCardsList = ({
  items,
  onEdit,
  onDelete,
  isDeleting,
  groupBy,
}: OwnerShiftCardsListProps) => {
  const { t } = useTranslation()
  const groups = useMemo(
    () => (groupBy ? groupBy(items) : [{ status: 'all', label: '', items }]),
    [groupBy, items]
  )

  return (
    <>
      {groups.map(({ status, label, items: groupItems }) => (
        <div key={status} className="ui-density-stack">
          {label ? <p className={PROFILE_SECTION_LABEL_CLASS}>{t(label)}</p> : null}
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
    </>
  )
}
