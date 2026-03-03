import { memo, useMemo } from 'react'
import { FileText, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerCloseButton,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Tabs } from '@/components/ui/tabs'
import { UserProfileDrawer } from '@/features/profile/ui/UserProfileDrawer'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '@/features/feed/model/types'
import { useLabels } from '@/shared/i18n/hooks'
import { useShiftDetails } from '@/features/feed/model/hooks/useShiftDetails'
import { StatusPill, UrgentPill } from '../StatusPill'
import { DetailsTab } from './DetailsTab'
import { ApplicantsTab } from './ApplicantsTab'
import { useShiftDetailsScreenController } from './useShiftDetailsScreenController'

interface ShiftDetailsScreenProps {
  shift: Shift | null
  vacancyData?: VacancyApiItem | null
  applicationId?: number | null
  isOpen: boolean
  onClose: () => void
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
  const { getRestaurantFormatLabel, getEmployeePositionLabel, getSpecializationLabel } = useLabels()
  const {
    aboutVenue,
    hourlyRate,
    shiftTypeLabel,
    vacancyTitle,
    positionLabel,
    specializations,
    applicationsInfo,
  } = useShiftDetails(shift, vacancyData)

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

  const showVenueBadges = useMemo(
    () =>
      Boolean(
        aboutVenue && (aboutVenue.city || aboutVenue.formatKey || aboutVenue.cuisineTypes.length > 0)
      ),
    [aboutVenue]
  )

  if (!shift) return null

  return (
    <>
      <Drawer
        open={isOpen}
        onOpenChange={open => {
          if (!open) controller.handleClose()
        }}
      >
        <div
          className="flex flex-col rounded-t-2xl bg-background min-h-0 shrink-0"
          style={{ height: 'calc(85vh - 52px)' }}
        >
          <DrawerHeader className="pb-4 pt-1 border-b border-border shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <DrawerTitle className="text-xl font-semibold break-words capitalize text-foreground">
                  {vacancyTitle}
                </DrawerTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {[shiftTypeLabel, shift.date, shift.time].filter(Boolean).join(' · ')}
                </p>
              </div>
              <DrawerCloseButton onClick={controller.handleClose} ariaLabel={t('common.close')} />
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-3">
              {shift.urgent ? <UrgentPill /> : null}
              <StatusPill status={controller.appStatus} />
            </div>
          </DrawerHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-5 pt-4 space-y-5 bg-background">
            {controller.showTabs ? (
              <Tabs
                options={[
                  { id: 'applicants', label: t('shift.applicants'), icon: Users },
                  { id: 'details', label: t('shift.details', 'Детали'), icon: FileText },
                ]}
                activeId={controller.activeTab}
                onChange={id => controller.setActiveTab(id as 'applicants' | 'details')}
                className="mb-4"
              />
            ) : null}

            {!controller.showTabs || controller.activeTab === 'details' ? (
              <DetailsTab
                positionLabel={positionLabel ?? ''}
                specializations={specializations}
                getSpecializationLabel={value => getSpecializationLabel(value ?? '')}
                hasDate={controller.hasDate}
                hasTime={controller.hasTime}
                shiftDate={shift.date}
                shiftTime={shift.time}
                duration={shift.duration}
                location={controller.location}
                onOpenMap={controller.handleOpenMap}
                pay={shift.pay}
                currency={shift.currency}
                paySuffix={controller.paySuffix}
                applicationsInfo={applicationsInfo}
                description={controller.description}
                requirements={controller.requirements}
                aboutVenue={aboutVenue}
                showVenueBadges={showVenueBadges}
                getRestaurantFormatLabel={value => getRestaurantFormatLabel(value ?? '')}
                isOwner={controller.isOwner}
                isApplied={isApplied}
                isAccepted={controller.isAccepted}
                isRejected={controller.isRejected}
                coverMessage={controller.coverMessage}
                setCoverMessage={controller.setCoverMessage}
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
          </div>

          {!controller.isOwner && !controller.isAccepted && !controller.isRejected ? (
            <DrawerFooter className="border-t border-border/50 bg-background shrink-0 px-5 py-4">
              <div className="flex gap-3">
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
                    size="md"
                    onClick={controller.handleApply}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? t('shift.sending') : t('shift.apply')}
                  </Button>
                )}
              </div>
            </DrawerFooter>
          ) : null}
        </div>
      </Drawer>

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
