import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Briefcase, Clock3 } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import { AppliedShiftCard } from '@/features/activity/ui/components/AppliedShiftCard'
import { groupAppliedByStatus } from '@/features/activity/model/utils/groupAppliedShifts'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { partitionListingsByShiftType } from '@/shared/shifts/mapping'
import { getLocalStorageItem, removeLocalStorageItem } from '@/shared/utils/localStorage'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { navigateToTab } from '@/shared/store/navigation'
import { cn } from '@/shared/utils/cn'
import { useAppDispatch } from '@/store/hooks'

interface MyApplicationsSectionProps {
  appliedShifts: VacancyApiItem[]
}

type AppliedStatusGroup = ReturnType<typeof groupAppliedByStatus>[number]

interface AppliedStatusGroupsProps {
  groups: AppliedStatusGroup[]
  isRejectedCollapsed: boolean
  onToggleRejected: () => void
}

const AppliedStatusGroups = ({
  groups,
  isRejectedCollapsed,
  onToggleRejected,
}: AppliedStatusGroupsProps) => {
  const { t } = useTranslation()

  return (
    <div className="ui-density-stack">
      {groups.map(({ status, label, items }) => {
        const isRejectedGroup = status === 'rejected'
        const isCollapsed = isRejectedGroup && isRejectedCollapsed

        return (
          <div key={status} className="flex flex-col gap-2">
            <button
              type="button"
              className={cn(
                'flex w-full items-center justify-between',
                PROFILE_SECTION_LABEL_CLASS
              )}
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
                  <AppliedShiftCard key={shift.id} shift={shift} />
                ))}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function MyApplicationsSection({ appliedShifts }: MyApplicationsSectionProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
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

  const { vacancies: vacancyApplications, replacements: replacementApplications } = useMemo(
    () => partitionListingsByShiftType(appliedShifts),
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
          image="applications"
          message={t('activity.noApplicationsYet')}
          description={t('activity.applicationsWillAppearHere')}
          action={
            <Button
              variant="gradient"
              size="md"
              className="px-6"
              onClick={() => dispatch(navigateToTab('feed'))}
            >
              {t('activity.findWorkCta')}
            </Button>
          }
        />
      ) : (
        <div className="ui-density-stack">
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
              />
            </section>
          ) : null}
        </div>
      )}
    </section>
  )
}
