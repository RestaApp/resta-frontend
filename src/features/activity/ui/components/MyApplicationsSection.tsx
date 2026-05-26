import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Briefcase, Clock3 } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { AppliedShiftCard } from '@/features/activity/ui/components/AppliedShiftCard'
import { groupAppliedByStatus } from '@/features/activity/model/utils/groupAppliedShifts'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { getLocalStorageItem, removeLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { EmptyState } from '@/components/ui/EmptyState'
import type { ToastType } from '@/components/ui/toast'

interface MyApplicationsSectionProps {
  appliedShifts: VacancyApiItem[]
  showToast: (m: string, t?: ToastType) => void
}

type AppliedStatusGroup = ReturnType<typeof groupAppliedByStatus>[number]

interface AppliedStatusGroupsProps {
  groups: AppliedStatusGroup[]
  isRejectedCollapsed: boolean
  onToggleRejected: () => void
  showToast: MyApplicationsSectionProps['showToast']
}

const AppliedStatusGroups = ({
  groups,
  isRejectedCollapsed,
  onToggleRejected,
  showToast,
}: AppliedStatusGroupsProps) => {
  const { t } = useTranslation()

  return (
    <div className="ui-density-stack-lg">
      {groups.map(({ status, label, items }) => {
        const isRejectedGroup = status === 'rejected'
        const isCollapsed = isRejectedGroup && isRejectedCollapsed

        return (
          <div key={status}>
            <button
              type="button"
              className="mb-2 flex w-full items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground"
              onClick={isRejectedGroup ? onToggleRejected : undefined}
              aria-expanded={!isCollapsed}
            >
              <span>{t(label)}</span>
              {isRejectedGroup ? (
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                />
              ) : null}
            </button>
            {!isCollapsed ? (
              <div className="ui-density-stack">
                {items.map(shift => (
                  <AppliedShiftCard key={shift.id} shift={shift} showToast={showToast} />
                ))}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
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

  const vacancyApplications = useMemo(
    () => appliedShifts.filter(shift => shift.shift_type === 'vacancy'),
    [appliedShifts]
  )
  const replacementApplications = useMemo(
    () => appliedShifts.filter(shift => shift.shift_type !== 'vacancy'),
    [appliedShifts]
  )
  const vacancyApplicationsByStatus = useMemo(
    () => groupAppliedByStatus(vacancyApplications),
    [vacancyApplications]
  )
  const replacementApplicationsByStatus = useMemo(
    () => groupAppliedByStatus(replacementApplications),
    [replacementApplications]
  )

  const handleToggleRejected = useCallback(() => {
    setIsRejectedCollapsed(prev => !prev)
  }, [])

  return (
    <section ref={sectionRef}>
      {appliedShifts.length === 0 ? (
        <EmptyState
          message={t('activity.noApplicationsYet')}
          description={t('activity.applicationsWillAppearHere')}
        />
      ) : (
        <div className="ui-density-stack-lg">
          {replacementApplications.length > 0 ? (
            <section className="ui-density-stack">
              <SectionHeader
                icon={Clock3}
                title={t('tabs.feed.shifts')}
                count={replacementApplications.length}
              />
              <AppliedStatusGroups
                groups={replacementApplicationsByStatus}
                isRejectedCollapsed={isRejectedCollapsed}
                onToggleRejected={handleToggleRejected}
                showToast={showToast}
              />
            </section>
          ) : null}

          {vacancyApplications.length > 0 ? (
            <section className="ui-density-stack">
              <SectionHeader
                icon={Briefcase}
                title={t('tabs.feed.jobs')}
                count={vacancyApplications.length}
              />
              <AppliedStatusGroups
                groups={vacancyApplicationsByStatus}
                isRejectedCollapsed={isRejectedCollapsed}
                onToggleRejected={handleToggleRejected}
                showToast={showToast}
              />
            </section>
          ) : null}
        </div>
      )}
    </section>
  )
}
