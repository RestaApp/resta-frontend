import { useTranslation } from 'react-i18next'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { UserProfileDrawer } from '@/shared/ui/user-profile/UserProfileDrawer'
import { useLabels } from '@/shared/i18n/hooks'
import { SUBSECTION_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { ApplicantsTab } from './ApplicantsTab'
import { useShiftApplicantsModeration } from './useShiftApplicantsModeration'

interface ShiftApplicantsSectionProps {
  shiftId: number
  vacancyData?: VacancyApiItem | null
  /** Владелец смены: блок откликов всегда виден, при 0 — empty state с иконкой. */
  alwaysShow?: boolean
  variant?: 'default' | 'owner'
}

export const ShiftApplicantsSection = ({
  shiftId,
  vacancyData,
  alwaysShow = false,
  variant = 'default',
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
  const hasApplicants =
    applicationsPreview.length > 0 ||
    (typeof moderation.applicationsCount === 'number' && moderation.applicationsCount > 0)

  if (!alwaysShow && !hasApplicants) return null

  const isOwnerLayout = variant === 'owner'
  const applicantsVariant = isOwnerLayout ? 'moderation' : 'default'
  const isAccepting = moderation.moderating?.action === 'accept'
  const acceptingApplicationId =
    isAccepting && typeof moderation.moderating?.id === 'number' ? moderation.moderating.id : null

  return (
    <section
      className={
        isOwnerLayout ? 'flex flex-col gap-2 border-t border-border pt-4' : 'flex flex-col gap-2'
      }
    >
      <h2
        className={isOwnerLayout ? SUBSECTION_TITLE_CLASS : 'text-sm font-semibold text-foreground'}
      >
        {t('shift.applicantsCount', { count: applicantsCount })}
      </h2>

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
        variant={applicantsVariant}
        onAcceptApplicant={
          isOwnerLayout
            ? applicationId => void moderation.handleAcceptApplication(applicationId)
            : undefined
        }
        isAccepting={isAccepting}
        acceptingApplicationId={acceptingApplicationId}
      />

      <UserProfileDrawer
        userId={moderation.selectedApplicantId}
        open={moderation.selectedApplicantId !== null}
        applicationId={moderation.selectedApplicantApplicationId}
        canModerate={moderation.canModerateSelected}
        applicationStatus={
          moderation.selectedAppStatus === 'accepted'
            ? 'accepted'
            : moderation.selectedAppStatus === 'rejected'
              ? 'rejected'
              : 'pending'
        }
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
