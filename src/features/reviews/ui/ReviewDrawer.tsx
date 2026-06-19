import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer, DrawerBody, DrawerFooter, DrawerFrame } from '@/components/ui/drawer'
import { DrawerTitleBar } from '@/components/ui/drawer-title-bar'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import { useToast } from '@/shared/lib/hooks/useToast'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import { useCreateReviewMutation } from '@/services/api/reviewsApi'
import type { UserBasicApi } from '@/services/api/shiftsApi.types'
import { StarRatingInput } from './StarRatingInput'

interface ReviewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shiftId: number
  reviewedUser: UserBasicApi
}

const MAX_COMMENT = 1000

export const ReviewDrawer = memo(function ReviewDrawer({
  open,
  onOpenChange,
  shiftId,
  reviewedUser,
}: ReviewDrawerProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [createReview, { isLoading }] = useCreateReviewMutation()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [anonymous, setAnonymous] = useState(false)

  const reviewedName = reviewedUser.full_name || reviewedUser.name || ''

  const reset = useCallback(() => {
    setRating(0)
    setComment('')
    setAnonymous(false)
  }, [])

  const handleClose = useCallback(
    (next: boolean) => {
      if (!next) reset()
      onOpenChange(next)
    },
    [onOpenChange, reset]
  )

  const handleSubmit = useCallback(async () => {
    if (rating < 1) return
    try {
      await createReview({
        reviewedId: reviewedUser.id,
        shiftId,
        rating,
        comment,
        anonymous,
      }).unwrap()
      showToast(t('reviews.submitSuccess'), 'success')
      reset()
      onOpenChange(false)
    } catch (error) {
      showToast(getErrorMessage(error) ?? t('reviews.submitError'), 'error')
    }
  }, [
    anonymous,
    comment,
    createReview,
    onOpenChange,
    rating,
    reset,
    reviewedUser.id,
    shiftId,
    showToast,
    t,
  ])

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerFrame>
        <DrawerTitleBar
          title={reviewedName ? t('reviews.titleFor', { name: reviewedName }) : t('reviews.title')}
          onClose={() => handleClose(false)}
        />

        <DrawerBody className="flex flex-col gap-4 pb-4 pt-2">
          <div className="flex flex-col items-center gap-2">
            <span className={PROFILE_SECTION_LABEL_CLASS}>{t('reviews.ratingLabel')}</span>
            <StarRatingInput
              value={rating}
              onChange={setRating}
              disabled={isLoading}
              ariaLabel={star => t('reviews.starAria', { count: star })}
            />
          </div>

          <FormField label={t('reviews.commentLabel')} hint={t('reviews.commentHint')}>
            <Textarea
              value={comment}
              onChange={event => setComment(event.target.value.slice(0, MAX_COMMENT))}
              placeholder={t('reviews.commentPlaceholder')}
              disabled={isLoading}
              rows={4}
              className="resize-none"
            />
          </FormField>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{t('reviews.anonymous')}</p>
              <p className="text-xs text-muted-foreground">{t('reviews.anonymousHint')}</p>
            </div>
            <Switch
              checked={anonymous}
              disabled={isLoading}
              ariaLabel={t('reviews.anonymous')}
              onCheckedChange={setAnonymous}
            />
          </div>
        </DrawerBody>

        <DrawerFooter>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => handleClose(false)}
              variant="outline"
              size="md"
              className="flex-1"
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              variant="gradient"
              size="md"
              className="flex-1"
              disabled={isLoading || rating < 1}
            >
              {t('reviews.submit')}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerFrame>
    </Drawer>
  )
})
