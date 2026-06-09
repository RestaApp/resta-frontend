import { memo } from 'react'
import type { TFunction } from 'i18next'
import { EmptyState } from '@/components/ui/EmptyState'
import type { ApplicationPreviewApiItem } from '@/services/api/shiftsApi'
import { ApplicantPreviewCard } from './ApplicantPreviewCard'

interface ApplicantsTabProps {
  applicationsPreview: ApplicationPreviewApiItem[]
  applicationsCount?: number
  fallbackCity?: string | null
  getEmployeePositionLabel: (value?: string | null) => string
  getSpecializationLabel: (value: string) => string
  onSelectApplicant: (userId: number, applicationId: number | null) => void
  t: TFunction
}

export const ApplicantsTab = memo(
  ({
    applicationsPreview,
    applicationsCount,
    fallbackCity,
    getEmployeePositionLabel,
    getSpecializationLabel,
    onSelectApplicant,
    t,
  }: ApplicantsTabProps) => {
    if (!applicationsPreview.length) {
      return (
        <EmptyState
          density="compact"
          image="shift-applicants"
          message={t('shift.noApplicants')}
          description={t('shift.noApplicantsDescription')}
        />
      )
    }

    return (
      <div className="ui-density-stack-sm">
        {applicationsPreview.map((app, index) => {
          const appId = app.shift_application_id ?? app.id
          const key = appId || index

          return (
            <ApplicantPreviewCard
              key={key}
              applicant={app}
              fallbackCity={fallbackCity}
              getEmployeePositionLabel={getEmployeePositionLabel}
              getSpecializationLabel={getSpecializationLabel}
              onSelect={onSelectApplicant}
              t={t}
            />
          )
        })}

        {typeof applicationsCount === 'number' && applicationsCount > applicationsPreview.length ? (
          <p className="px-1 text-xs text-muted-foreground">
            {t('shift.applicantsPreviewNote', {
              shown: applicationsPreview.length,
              total: applicationsCount,
            })}
          </p>
        ) : null}
      </div>
    )
  }
)

ApplicantsTab.displayName = 'ApplicantsTab'
