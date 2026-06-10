import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'
import { OwnerShiftCardsList } from '@/features/activity/ui/components/OwnerShiftCardsList'
import type { VacancyApiItem } from '@/services/api/shiftsApi'

interface MyShiftsSectionProps {
  shifts: VacancyApiItem[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  isDeleting: boolean
}

export function MyShiftsSection({ shifts, onEdit, onDelete, isDeleting }: MyShiftsSectionProps) {
  const { t } = useTranslation()

  return (
    <section className="ui-density-stack">
      {shifts.length === 0 ? (
        <EmptyState
          image="shifts"
          message={t('activity.noShiftsYet')}
          description={t('activity.shiftsWillAppearHere')}
          action={
            <Button
              variant="gradient"
              size="md"
              className="px-6"
              onClick={() => emitAppEvent(APP_EVENTS.OPEN_ACTIVITY_ADD_SHIFT)}
            >
              {t('activity.createShiftEmptyCta')}
            </Button>
          }
        />
      ) : (
        <OwnerShiftCardsList
          items={shifts}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      )}
    </section>
  )
}
