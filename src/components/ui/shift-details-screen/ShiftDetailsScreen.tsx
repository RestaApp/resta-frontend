import { memo } from 'react'
import { FileText, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { DrawerFooter } from '@/components/ui/drawer'
import { Tabs } from '@/components/ui/tabs'
import { UserProfileDrawer } from '@/features/profile/ui/UserProfileDrawer'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '@/features/feed/model/types'
import { useLabels } from '@/shared/i18n/hooks'
import { useShiftDetails } from '@/features/feed/model/hooks/useShiftDetails'
import { DetailsTab } from './DetailsTab'
import { ApplicantsTab } from './ApplicantsTab'
import { useShiftDetailsScreenController } from './useShiftDetailsScreenController'
import { DetailsScreenFrame } from './DetailsScreenFrame'
import { TAB_ACTIVE_INDICATOR_CLASS, TAB_ACTIVE_TRIGGER_CLASS } from '@/components/ui/ui-patterns'

interface ShiftDetailsScreenProps {
  shift: Shift | null
  vacancyData?: VacancyApiItem | null
  applicationId?: number | null
  isOpen: boolean
  onClose: () => void
  onOpenRestaurant?: (restaurantId: number) => void
  onApply: (id: number, message?: string) => Promise<void>
  isApplied: boolean
  onCancel: (applicationId: number | null | undefined, shiftId: number) => Promise<void>
  isLoading?: boolean
}

export const ShiftDetailsScreen = memo((props: ShiftDetailsScreenProps) => {
  const {
    shift,
    vacancyData,
    applicationId = null,
    isOpen,
    onClose,
    onApply,
    isApplied,
    onCancel,
    isLoading = false,
  } = props

  const { t } = useTranslation()
  const { getEmployeePositionLabel } = useLabels()
  const { hourlyRate, shiftTypeLabel, vacancyTitle, positionLabel } = useShiftDetails(
    shift,
    vacancyData
  )

  const controller = useShiftDetailsScreenController({
    shift,
    vacancyData,
    applicationId,
    onClose,
    onApply,
    onCancel,
    hourlyRate,
    t,
  })

  if (!shift) return null

  return (
    <>
      <DetailsScreenFrame
        variant="page"
        open={isOpen}
        onOpenChange={open => {
          if (!open) controller.handleClose()
        }}
        onClose={controller.handleClose}
        closeAriaLabel={t('common.close')}
        title={shiftTypeLabel || t('shift.shift', { defaultValue: 'Смена' })}
        footer={
          !controller.isOwner && !controller.isAccepted && !controller.isRejected ? (
            <DrawerFooter className="shrink-0 border-border/30">
              <div className="flex gap-4">
                {isApplied ? (
                  <Button
                    onClick={controller.handleCancel}
                    disabled={isLoading}
                    variant="outline"
                    size="md"
                    className="flex-1"
                  >
                    {isLoading ? t('shift.cancelling') : t('shift.cancelApplication')}
                  </Button>
                ) : (
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={controller.handleApply}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading
                      ? t('shift.sending')
                      : t('shift.applyNow', { defaultValue: 'Откликнуться' })}
                  </Button>
                )}
              </div>
            </DrawerFooter>
          ) : null
        }
      >
        {controller.showTabs ? (
          <Tabs
            options={[
              { id: 'applicants', label: t('shift.applicants'), icon: Users },
              { id: 'details', label: t('shift.details', 'Детали'), icon: FileText },
            ]}
            activeId={controller.activeTab}
            onChange={id => controller.setActiveTab(id as 'applicants' | 'details')}
            className="mb-4"
            activeIndicatorClassName={TAB_ACTIVE_INDICATOR_CLASS}
            activeTriggerClassName={TAB_ACTIVE_TRIGGER_CLASS}
          />
        ) : null}

        {!controller.showTabs || controller.activeTab === 'details' ? (
          <DetailsTab
            shift={shift}
            vacancyTitle={vacancyTitle}
            positionLabel={positionLabel ?? ''}
            shiftDate={shift.date}
            shiftTime={shift.time}
            duration={shift.duration}
            locationPoints={controller.locationPoints}
            pay={shift.pay}
            currency={shift.currency}
            hourlyRate={hourlyRate}
            description={controller.description}
            requirements={controller.requirements}
            managerName={vacancyData?.user?.name ?? vacancyData?.user?.full_name ?? null}
            t={t}
          />
        ) : null}

        {controller.showTabs && controller.activeTab === 'applicants' ? (
          <ApplicantsTab
            applicants={controller.applicants}
            applicationsCount={controller.applicationsCount}
            moderating={controller.moderating}
            getEmployeePositionLabel={value => getEmployeePositionLabel(value ?? '')}
            onSelectApplicant={(userId, appId) => {
              controller.setSelectedApplicantId(userId)
              controller.setSelectedApplicantApplicationId(appId)
            }}
            onAcceptApplication={controller.handleAcceptApplication}
            onRejectApplication={controller.handleRejectApplication}
            t={t}
          />
        ) : null}
      </DetailsScreenFrame>

      <UserProfileDrawer
        userId={controller.selectedApplicantId}
        open={controller.selectedApplicantId !== null}
        applicationId={controller.selectedApplicantApplicationId}
        canModerate={controller.canModerateSelected}
        applicationStatus={controller.selectedAppStatus === 'accepted' ? 'accepted' : 'pending'}
        moderatingAction={
          controller.moderating?.id === controller.selectedApplicantApplicationId
            ? controller.moderating.action
            : null
        }
        onAccept={async () => {
          if (typeof controller.selectedApplicantApplicationId !== 'number') return
          await controller.handleAcceptApplication(controller.selectedApplicantApplicationId)
        }}
        onReject={async () => {
          if (typeof controller.selectedApplicantApplicationId !== 'number') return
          await controller.handleRejectApplication(controller.selectedApplicantApplicationId)
        }}
        onClose={() => {
          controller.setSelectedApplicantId(null)
          controller.setSelectedApplicantApplicationId(null)
        }}
      />
    </>
  )
})

ShiftDetailsScreen.displayName = 'ShiftDetailsScreen'
