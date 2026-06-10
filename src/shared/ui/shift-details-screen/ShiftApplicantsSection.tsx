import { Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { UserProfileDrawer } from '@/shared/ui/user-profile/UserProfileDrawer'
import { useLabels } from '@/shared/i18n/hooks'
import { formatViewsCount } from '@/shared/utils/viewsCount'
import { ApplicantsTab } from './ApplicantsTab'
import { useShiftApplicantsModeration } from './useShiftApplicantsModeration'

interface ShiftApplicantsSectionProps {
  shiftId: number
  vacancyData?: VacancyApiItem | null
  /** Владелец смены: блок откликов всегда виден, при 0 — empty state с иконкой. */
  alwaysShow?: boolean
}

export const ShiftApplicantsSection = ({
  shiftId,
  vacancyData,
  alwaysShow = false,
}: ShiftApplicantsSectionProps) => {
  const { t } = useTranslation()
  const { getEmployeePositionLabel, getSpecializationLabel } = useLabels()

  const moderation = useShiftApplicantsModeration({
    shiftId,
    vacancyData,
    t,
  })

  const applicationsPreview = moderation.applicationsPreview
  const applicantsCount = moderation.applicationsCount ?? applicationsPreview.length
  const viewsCount = vacancyData?.views_count
  const hasViewsCount = typeof viewsCount === 'number' && Number.isFinite(viewsCount)
  const hasApplicants =
    applicationsPreview.length > 0 ||
    (typeof moderation.applicationsCount === 'number' && moderation.applicationsCount > 0)

  if (!alwaysShow && !hasApplicants && !hasViewsCount) return null

  return (
    <section className="ui-density-stack">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-sm font-semibold text-foreground">
          {t('shift.applicantsCount', { count: applicantsCount })}
        </h2>
        {hasViewsCount ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" aria-hidden />
            {formatViewsCount(viewsCount)}
          </span>
        ) : null}
      </div>

      <ApplicantsTab
        applicationsPreview={applicationsPreview}
        applicationsCount={moderation.applicationsCount}
        fallbackCity={vacancyData?.city}
        getEmployeePositionLabel={value => getEmployeePositionLabel(value ?? '')}
        getSpecializationLabel={getSpecializationLabel}
        onSelectApplicant={(userId, appId) => {
          moderation.setSelectedApplicantId(userId)
          moderation.setSelectedApplicantApplicationId(appId)
        }}
        t={t}
      />

      <UserProfileDrawer
        userId={moderation.selectedApplicantId}
        open={moderation.selectedApplicantId !== null}
        applicationId={moderation.selectedApplicantApplicationId}
        canModerate={moderation.canModerateSelected}
        applicationStatus={moderation.selectedAppStatus === 'accepted' ? 'accepted' : 'pending'}
        moderatingAction={
          moderation.moderating?.id === moderation.selectedApplicantApplicationId
            ? moderation.moderating.action
            : null
        }
        onAccept={async () => {
          if (typeof moderation.selectedApplicantApplicationId !== 'number') return
          await moderation.handleAcceptApplication(moderation.selectedApplicantApplicationId)
        }}
        onReject={async () => {
          if (typeof moderation.selectedApplicantApplicationId !== 'number') return
          await moderation.handleRejectApplication(moderation.selectedApplicantApplicationId)
        }}
        onClose={moderation.closeApplicantProfile}
      />
    </section>
  )
}
