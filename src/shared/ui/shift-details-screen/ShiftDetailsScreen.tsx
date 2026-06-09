import { memo, useCallback, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { DrawerFooter } from '@/components/ui/drawer'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '@/shared/shifts/types'
import { useShiftDetails } from '@/shared/shifts/useShiftDetails'
import { formatUserDisplayName } from '@/shared/utils/userDisplayName'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DetailsTab } from './DetailsTab'
import { useShiftDetailsScreenController } from './useShiftDetailsScreenController'
import { DetailsScreenFrame } from './DetailsScreenFrame'

export interface ShiftDetailsOwnerActions {
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  isDeleting?: boolean
}

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
  ownerActions?: ShiftDetailsOwnerActions
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
    ownerActions,
  } = props

  const { t } = useTranslation()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { hourlyRate, vacancyTitle, positionLabel } = useShiftDetails(shift, vacancyData)
  const ownerDisplayName = useMemo(
    () => formatUserDisplayName(vacancyData?.user),
    [vacancyData?.user]
  )

  const controller = useShiftDetailsScreenController({
    shift,
    vacancyData,
    applicationId,
    onClose,
    onApply,
    onCancel,
    t,
  })

  const handleEdit = useCallback(() => {
    if (shift) ownerActions?.onEdit(shift.id)
  }, [ownerActions, shift])

  const handleDeleteRequest = useCallback(() => {
    setConfirmOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (shift) ownerActions?.onDelete(shift.id)
    setConfirmOpen(false)
  }, [ownerActions, shift])

  if (!shift) return null

  const ownerFooter =
    controller.isOwner && ownerActions ? (
      <DrawerFooter className="pb-3">
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="md"
            onClick={handleDeleteRequest}
            disabled={ownerActions.isDeleting}
            className="flex-1"
          >
            {ownerActions.isDeleting
              ? t('common.deleting', { defaultValue: 'Удаление...' })
              : t('common.delete')}
          </Button>
          <Button
            variant="gradient"
            size="md"
            onClick={handleEdit}
            disabled={ownerActions.isDeleting}
            className="flex-1"
          >
            {t('common.edit')}
          </Button>
        </div>
      </DrawerFooter>
    ) : null

  const applicantFooter =
    !controller.isOwner && !controller.isAccepted && !controller.isRejected ? (
      <DrawerFooter className="pb-3">
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
              size="md"
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

  return (
    <>
      <DetailsScreenFrame
        variant="page"
        open={isOpen}
        onOpenChange={open => {
          if (!open) controller.handleClose()
        }}
        onClose={controller.handleClose}
        footer={ownerFooter ?? applicantFooter}
      >
        <DetailsTab
          shift={shift}
          vacancyTitle={vacancyTitle}
          positionLabel={positionLabel ?? ''}
          ownerDisplayName={ownerDisplayName}
          shiftDate={shift.date}
          shiftTime={shift.time}
          duration={shift.duration}
          locationPoints={controller.locationPoints}
          pay={shift.pay}
          currency={shift.currency}
          hourlyRate={hourlyRate}
          description={controller.description}
          requirements={controller.requirements}
          t={t}
        />
      </DetailsScreenFrame>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('shift.deleteConfirmTitle')}
        description={t('shift.deleteConfirmDesc')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('common.delete')}
        onConfirm={confirmDelete}
      />
    </>
  )
})

ShiftDetailsScreen.displayName = 'ShiftDetailsScreen'
