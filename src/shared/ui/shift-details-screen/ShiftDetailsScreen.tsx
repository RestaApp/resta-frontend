import { memo, useCallback, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DrawerFooter } from '@/components/ui/drawer'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { useBoostShiftMutation } from '@/services/api/purchasesApi'
import { useGetCurrentSubscriptionQuery } from '@/services/api/subscriptionsApi'
import { MONETIZATION_ENABLED } from '@/shared/config/monetization'
import type { Shift } from '@/shared/shifts/types'
import { useShiftDetails } from '@/shared/shifts/useShiftDetails'
import { formatUserDisplayName } from '@/shared/utils/userDisplayName'
import { useToast } from '@/shared/lib/hooks/useToast'
import { triggerHapticFeedback } from '@/shared/utils/haptics'
import { usePurchaseFlow } from '@/features/monetization/purchaseFlowContext'
import { parsePaymentRequired } from '@/shared/lib/monetization/paymentRequired'
import { waitWithBackoff } from '@/shared/lib/monetization/waitWithBackoff'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { UserProfileDrawer } from '@/shared/ui/user-profile/UserProfileDrawer'
import { ShiftReviewSection } from '@/features/reviews/ui/ShiftReviewSection'
import { DetailsTab } from './DetailsTab'
import { ShiftApplicantsSection } from './ShiftApplicantsSection'
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
  const [ownerProfileOpen, setOwnerProfileOpen] = useState(false)
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

  const handleOpenOwnerProfile = useCallback(() => {
    if (shift?.ownerId) setOwnerProfileOpen(true)
  }, [shift?.ownerId])

  const handleCloseOwnerProfile = useCallback(() => {
    setOwnerProfileOpen(false)
  }, [])

  const confirmDelete = useCallback(() => {
    if (shift) ownerActions?.onDelete(shift.id)
    setConfirmOpen(false)
  }, [ownerActions, shift])

  const { showToast } = useToast()
  const { requestPurchase } = usePurchaseFlow()
  const [boostShift, { isLoading: isBoosting }] = useBoostShiftMutation()

  // Остаток бесплатных бустов (`monthly_boosts`, Flipper OFF). Виден только
  // владельцу при включённом флаге фронта и непустом usage с бэка.
  const { data: subscription } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !MONETIZATION_ENABLED || !controller.isOwner,
  })
  const freeBoosts = subscription?.data.usage?.monthly_boosts

  // Срочное продвижение: PATCH /boost; при 402 → покупка urgent_boost → повтор.
  const handleBoost = useCallback(async () => {
    if (!shift) return
    const boostOnce = () => boostShift(shift.id).unwrap()
    try {
      await boostOnce()
    } catch (error: unknown) {
      const info = parsePaymentRequired(error)
      if (!info) return
      const paid = await requestPurchase(info)
      if (!paid) return
      const ok = await waitWithBackoff(async () => {
        try {
          await boostOnce()
          return true
        } catch (retryError: unknown) {
          if (parsePaymentRequired(retryError)) return null
          throw retryError
        }
      })
      if (!ok) {
        showToast(t('monetization.purchase.processing'), 'error')
        return
      }
    }
    triggerHapticFeedback('success')
    showToast(t('monetization.boost.success'), 'success')
  }, [shift, boostShift, requestPurchase, showToast, t])

  if (!shift) return null

  const canBoost =
    controller.isOwner &&
    shift.urgent !== true &&
    shift.listingStatus !== 'filled' &&
    shift.listingStatus !== 'closed'

  const ownerFooter =
    controller.isOwner && ownerActions ? (
      <DrawerFooter className="pb-3">
        <div className="flex flex-col gap-2">
          {canBoost ? (
            <>
              {freeBoosts && freeBoosts.remaining > 0 ? (
                <p className="text-center text-xs text-muted-foreground">
                  {t('monetization.usage.boosts', {
                    remaining: freeBoosts.remaining,
                    limit: freeBoosts.limit,
                  })}
                </p>
              ) : null}
              <Button
                variant="outline"
                size="md"
                onClick={handleBoost}
                loading={isBoosting}
                disabled={isBoosting || ownerActions.isDeleting}
                className="w-full"
              >
                <Zap className="h-4 w-4" aria-hidden="true" />
                {t('monetization.boost.action')}
              </Button>
            </>
          ) : null}
          <div className="flex gap-4">
            <Button
              variant="destructive"
              size="md"
              onClick={handleDeleteRequest}
              disabled={ownerActions.isDeleting || isBoosting}
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
              disabled={ownerActions.isDeleting || isBoosting}
              className="flex-1"
            >
              {t('common.edit')}
            </Button>
          </div>
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
                : t('shift.applyForThisShift', { defaultValue: 'Откликнуться на смену' })}
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
        <div className="ui-density-stack">
          <DetailsTab
            shift={shift}
            vacancyTitle={vacancyTitle}
            positionLabel={positionLabel ?? ''}
            ownerDisplayName={ownerDisplayName}
            ownerRating={vacancyData?.user?.average_rating ?? null}
            ownerReviews={vacancyData?.user?.total_reviews ?? null}
            applicationsCount={vacancyData?.applications_count ?? shift.applicationsCount ?? null}
            showVenueCard={!controller.isOwner && Boolean(shift.ownerId)}
            onOpenOwnerProfile={handleOpenOwnerProfile}
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

          {controller.isOwner ? (
            <ShiftApplicantsSection
              shiftId={shift.id}
              vacancyData={vacancyData}
              alwaysShow
              variant="owner"
            />
          ) : null}

          <ShiftReviewSection vacancyData={vacancyData} />
        </div>
      </DetailsScreenFrame>

      <UserProfileDrawer
        userId={shift.ownerId ?? null}
        open={ownerProfileOpen}
        onClose={handleCloseOwnerProfile}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('shift.deleteConfirmTitle')}
        description={t('shift.deleteConfirmDesc')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('common.delete')}
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  )
})

ShiftDetailsScreen.displayName = 'ShiftDetailsScreen'
