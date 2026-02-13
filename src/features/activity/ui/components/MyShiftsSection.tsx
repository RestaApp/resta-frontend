import { useTranslation } from 'react-i18next'
import { Briefcase } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { PersonalShiftCard } from '@/features/activity/ui/components/PersonalShiftCard'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyBriefcaseIllustration } from '@/components/ui/empty-illustrations'

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
      <SectionHeader icon={Briefcase} title={t('activity.myShifts')} count={shifts.length} />
      {shifts.length === 0 ? (
        <EmptyState
          message={t('activity.noShiftsYet')}
          description={t('activity.shiftsWillAppearHere')}
          illustration={<EmptyBriefcaseIllustration className="h-24 w-24" />}
        />
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
