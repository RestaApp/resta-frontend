import { useTranslation } from 'react-i18next'
import { Briefcase } from 'lucide-react'
import { SectionHeaderWithIcon } from '@/components/ui/section-header-with-icon'
import { PersonalShiftCard } from '@/features/activity/ui/components/PersonalShiftCard'
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
    <section>
      <SectionHeaderWithIcon
        icon={Briefcase}
        title={t('activity.myShifts')}
        count={shifts.length}
      />
      {shifts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 py-8 px-4 text-center">
          <p className="text-sm text-muted-foreground">{t('activity.noShiftsYet')}</p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            {t('activity.shiftsWillAppearHere')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {shifts.map(shift => (
            <PersonalShiftCard
              key={shift.id}
              shift={shift}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </section>
  )
}
