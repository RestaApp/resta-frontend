import { memo, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Briefcase, Send } from 'lucide-react'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PersonalShiftCard } from '@/features/activity/ui/components/PersonalShiftCard'
import { AppliedShiftCard } from '@/features/activity/ui/components/AppliedShiftCard'
import { groupAppliedByStatus } from '@/features/activity/model/utils/groupAppliedShifts'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { getLocalStorageItem, removeLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'

type Props = {
  isLoading: boolean
  isAppliedLoading: boolean
  isError: boolean
  shifts: VacancyApiItem[]
  appliedShifts: VacancyApiItem[]
  isDeleting: boolean
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void
}

const SectionHeader = memo(({ icon: Icon, title, count }: { icon: typeof Briefcase; title: string; count?: number }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
      <Icon className="w-4 h-4" />
    </div>
    <h2 className="text-base font-semibold text-foreground">{title}</h2>
    {count != null && count > 0 ? (
      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count}</span>
    ) : null}
  </div>
))
SectionHeader.displayName = 'SectionHeader'

export const ActivityListTab = memo((props: Props) => {
  const { t } = useTranslation()
  const { isLoading, isAppliedLoading, isError, shifts, appliedShifts, isDeleting, onEdit, onDelete, showToast } = props

  const myApplicationsRef = useRef<HTMLElement | null>(null)

  // Скролл к разделу "Мои отклики", если пришёл соответствующий флаг в localStorage
  useEffect(() => {
    const flag = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_ACTIVITY_MY_APPLICATIONS)
    if (flag && myApplicationsRef.current) {
      // Небольшая задержка, чтобы гарантировать рендер контента
      setTimeout(() => {
        myApplicationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        removeLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_ACTIVITY_MY_APPLICATIONS)
      }, 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const appliedByStatus = useMemo(() => groupAppliedByStatus(appliedShifts), [appliedShifts])

  if (isLoading || isAppliedLoading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-9 w-48 bg-muted/50 rounded-xl mb-3" />
          <div className="space-y-4">
            <ShiftSkeleton />
            <ShiftSkeleton />
          </div>
        </div>
        <div>
          <div className="h-9 w-40 bg-muted/50 rounded-xl mb-3" />
          <div className="space-y-4">
            <ShiftSkeleton />
            <ShiftSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return <div className="text-center py-8 text-destructive">{t('feed.loadErrorShifts')}</div>
  }

  if (shifts.length === 0 && appliedShifts.length === 0) {
    return <EmptyState message={t('activity.emptyList')} />
  }

  return (
    <div className="space-y-10">
      {/* Мои смены */}
      <section>
        <SectionHeader icon={Briefcase} title={t('activity.myShifts')} count={shifts.length} />
        {shifts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 py-8 px-4 text-center">
            <p className="text-sm text-muted-foreground">{t('activity.noShiftsYet')}</p>
            <p className="text-xs text-muted-foreground/80 mt-1">{t('activity.shiftsWillAppearHere')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shifts.map((shift) => (
              <PersonalShiftCard key={shift.id} shift={shift} onEdit={onEdit} onDelete={onDelete} isDeleting={isDeleting} />
            ))}
          </div>
        )}
      </section>

      {/* Мои отклики */}
      <section ref={myApplicationsRef as any}>
        <SectionHeader icon={Send} title={t('activity.myApplications')} count={appliedShifts.length} />
        {appliedShifts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 py-8 px-4 text-center">
            <p className="text-sm text-muted-foreground">{t('activity.noApplicationsYet')}</p>
            <p className="text-xs text-muted-foreground/80 mt-1">{t('activity.applicationsWillAppearHere')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {appliedByStatus.map(({ status, label, items }) => (
              <div key={status}>
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">{t(label)}</h3>
                <div className="space-y-4">
                  {items.map((shift) => (
                    <AppliedShiftCard key={shift.id} shift={shift} showToast={showToast} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
})
ActivityListTab.displayName = 'ActivityListTab'
