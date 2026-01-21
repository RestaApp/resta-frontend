import { memo } from 'react'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { EmptyState } from '@/features/feed/ui/components/EmptyState'
import { PersonalShiftCard } from '@/features/activity/ui/components/PersonalShiftCard'
import { AppliedShiftCard } from '@/features/activity/ui/components/AppliedShiftCard'

type Props = {
  isLoading: boolean
  isAppliedLoading: boolean
  isError: boolean
  shifts: any[]
  appliedShifts: any[]
  isDeleting: boolean
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void
}

export const ActivityListTab = memo((props: Props) => {
  const { isLoading, isAppliedLoading, isError, shifts, appliedShifts, isDeleting, onEdit, onDelete, showToast } = props

  if (isLoading || isAppliedLoading) return <ShiftSkeleton />
  if (isError) return <div className="text-center py-8 text-destructive">Ошибка загрузки смен</div>
  if (shifts.length === 0 && appliedShifts.length === 0) return <EmptyState message="Смены не найдены" />

  return (
    <div className="space-y-3">
      {shifts.map((shift: any) => (
        <PersonalShiftCard key={shift.id} shift={shift} onEdit={onEdit} onDelete={onDelete} isDeleting={isDeleting} />
      ))}

      {appliedShifts.length > 0 ? (
        <>
          {shifts.length > 0 ? <div className="text-sm text-muted-foreground mt-4 mb-2">Мои отклики</div> : null}
          <div className="space-y-4">
            {appliedShifts.map((shift: any) => (
              <AppliedShiftCard key={shift.id} shift={shift} showToast={(m, t) => showToast(m, t)} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
})
ActivityListTab.displayName = 'ActivityListTab'
