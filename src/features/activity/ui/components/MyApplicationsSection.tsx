import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, ChevronDown } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { AppliedShiftCard } from '@/features/activity/ui/components/AppliedShiftCard'
import { groupAppliedByStatus } from '@/features/activity/model/utils/groupAppliedShifts'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { getLocalStorageItem, removeLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { EmptyState } from '@/components/ui/EmptyState'

interface MyApplicationsSectionProps {
  appliedShifts: VacancyApiItem[]
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void
}

export function MyApplicationsSection({ appliedShifts, showToast }: MyApplicationsSectionProps) {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const [isRejectedCollapsed, setIsRejectedCollapsed] = useState(true)

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

  const handleToggleRejected = useCallback(() => {
    setIsRejectedCollapsed(prev => !prev)
  }, [])

  return (
    <section ref={sectionRef}>
      <SectionHeader
        icon={Send}
        title={t('activity.myApplications')}
        count={appliedShifts.length}
      />
      {appliedShifts.length === 0 ? (
        <EmptyState
          message={t('activity.noApplicationsYet')}
          description={t('activity.applicationsWillAppearHere')}
        />
      ) : (
        <div className="space-y-6">
          {appliedByStatus.map(({ status, label, items }) => {
            const isRejectedGroup = status === 'rejected'
            const isCollapsed = isRejectedGroup && isRejectedCollapsed

            return (
              <div key={status}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2"
                  onClick={isRejectedGroup ? handleToggleRejected : undefined}
                  aria-expanded={!isCollapsed}
                >
                  <span>{t(label)}</span>
                  {isRejectedGroup ? (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isCollapsed ? '' : 'rotate-180'
                      }`}
                    />
                  ) : null}
                </button>
                {!isCollapsed ? (
                  <div className="space-y-4">
                    {items.map(shift => (
                      <AppliedShiftCard key={shift.id} shift={shift} showToast={showToast} />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
