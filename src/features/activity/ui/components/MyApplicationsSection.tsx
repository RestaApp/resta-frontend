import { useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'
import { SectionHeaderWithIcon } from '@/components/ui/section-header-with-icon'
import { AppliedShiftCard } from '@/features/activity/ui/components/AppliedShiftCard'
import { groupAppliedByStatus } from '@/features/activity/model/utils/groupAppliedShifts'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { getLocalStorageItem, removeLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'

interface MyApplicationsSectionProps {
  appliedShifts: VacancyApiItem[]
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void
}

export function MyApplicationsSection({ appliedShifts, showToast }: MyApplicationsSectionProps) {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const flag = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_ACTIVITY_MY_APPLICATIONS)
    if (!flag) return

    const el = sectionRef.current
    if (!el) return

    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      removeLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_ACTIVITY_MY_APPLICATIONS)
    })
  }, [])

  const appliedByStatus = useMemo(() => groupAppliedByStatus(appliedShifts), [appliedShifts])

  return (
    <section ref={sectionRef}>
      <SectionHeaderWithIcon
        icon={Send}
        title={t('activity.myApplications')}
        count={appliedShifts.length}
      />
      {appliedShifts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 py-8 px-4 text-center">
          <p className="text-sm text-muted-foreground">{t('activity.noApplicationsYet')}</p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            {t('activity.applicationsWillAppearHere')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {appliedByStatus.map(({ status, label, items }) => (
            <div key={status}>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                {t(label)}
              </h3>
              <div className="space-y-4">
                {items.map(shift => (
                  <AppliedShiftCard key={shift.id} shift={shift} showToast={showToast} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
