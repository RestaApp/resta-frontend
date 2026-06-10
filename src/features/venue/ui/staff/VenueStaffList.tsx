import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ApplicationPreviewApiItem } from '@/services/api/shiftsApi'
import { EmptyState } from '@/components/ui/EmptyState'
import { FeedCardSkeletonList } from '@/components/ui/shift-skeleton'
import { SUBSECTION_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { ApplicantsTab } from '@/shared/ui/shift-details-screen/ApplicantsTab'
import { useLabels } from '@/shared/i18n/hooks'

export interface StaffItem {
  shiftId: number
  shiftTitle: string
  applicationId: number
  applicationStatus: string
  person: ApplicationPreviewApiItem
}

interface ShiftApplicantsGroup {
  shiftId: number
  shiftTitle: string
  applications: ApplicationPreviewApiItem[]
}

interface VenueStaffListProps {
  isLoading: boolean
  items: StaffItem[]
  isAccepting: boolean
  acceptingApplicationId: number | null
  onAccept: (applicationId: number, shiftId: number) => void
  onSelectApplicant: (userId: number, applicationId: number | null, shiftId: number) => void
}

export const VenueStaffList = ({
  isLoading,
  items,
  isAccepting,
  acceptingApplicationId,
  onAccept,
  onSelectApplicant,
}: VenueStaffListProps) => {
  const { t } = useTranslation()
  const { getEmployeePositionLabel, getSpecializationLabel } = useLabels()

  const shiftGroups = useMemo<ShiftApplicantsGroup[]>(() => {
    const map = new Map<number, ShiftApplicantsGroup>()

    for (const item of items) {
      const existing = map.get(item.shiftId)
      if (existing) {
        existing.applications.push(item.person)
        continue
      }

      map.set(item.shiftId, {
        shiftId: item.shiftId,
        shiftTitle: item.shiftTitle,
        applications: [item.person],
      })
    }

    return Array.from(map.values())
  }, [items])

  return (
    <div className="ui-density-page ui-density-py">
      {isLoading ? (
        <FeedCardSkeletonList variant="staff" className="ui-density-stack" />
      ) : items.length === 0 ? (
        <EmptyState
          image="shift-applicants"
          message={t('shift.noApplicants')}
          description={t('shift.noApplicantsDescription')}
        />
      ) : (
        <div className="ui-density-stack">
          {shiftGroups.map(group => (
            <section key={group.shiftId} className="ui-density-stack">
              {group.shiftTitle ? (
                <h2 className={SUBSECTION_TITLE_CLASS}>{group.shiftTitle}</h2>
              ) : null}
              <h3 className={SUBSECTION_TITLE_CLASS}>
                {t('shift.applicantsCount', { count: group.applications.length })}
              </h3>
              <ApplicantsTab
                applicationsPreview={group.applications}
                applicationsCount={group.applications.length}
                getEmployeePositionLabel={value => getEmployeePositionLabel(value ?? '')}
                getSpecializationLabel={getSpecializationLabel}
                onSelectApplicant={(userId, applicationId) =>
                  onSelectApplicant(userId, applicationId, group.shiftId)
                }
                t={t}
                variant="moderation"
                onAcceptApplicant={applicationId => onAccept(applicationId, group.shiftId)}
                isAccepting={isAccepting}
                acceptingApplicationId={acceptingApplicationId}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
