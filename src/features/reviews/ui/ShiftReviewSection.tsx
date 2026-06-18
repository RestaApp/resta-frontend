import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SUBSECTION_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { SHIFT_CARD_CLASS } from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { ReviewDrawer } from './ReviewDrawer'

const ReadonlyStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5" aria-label={String(rating)}>
    {[1, 2, 3, 4, 5].map(star => (
      <Star
        key={star}
        className={cn(
          'h-4 w-4',
          star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
        )}
      />
    ))}
  </div>
)

interface ShiftReviewSectionProps {
  vacancyData?: VacancyApiItem | null
}

/**
 * Блок отзыва на завершённой смене ресторана: показывает оставленный отзыв
 * либо CTA «оставить отзыв» участнику смены (review_target).
 */
export const ShiftReviewSection = memo(function ShiftReviewSection({
  vacancyData,
}: ShiftReviewSectionProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  if (!vacancyData) return null

  const {
    my_review: myReview,
    can_leave_review: canLeaveReview,
    review_target: target,
  } = vacancyData

  // Ничего не показываем, если смена не завершена / не ресторанная (поля отсутствуют).
  if (!myReview && !(canLeaveReview && target)) return null

  return (
    <section className="flex flex-col gap-2 border-t border-border pt-4">
      <h2 className={SUBSECTION_TITLE_CLASS}>{t('reviews.sectionTitle')}</h2>

      {myReview ? (
        <Card className={cn(SHIFT_CARD_CLASS, 'flex flex-col gap-1.5')}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">{t('reviews.yourReview')}</span>
            <ReadonlyStars rating={myReview.rating ?? 0} />
          </div>
          {myReview.comment ? (
            <p className="whitespace-pre-line text-sm text-muted-foreground">{myReview.comment}</p>
          ) : null}
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{t('reviews.prompt')}</p>
          <Button
            type="button"
            variant="gradient"
            size="md"
            className="self-start"
            onClick={() => setOpen(true)}
          >
            <Star className="h-4 w-4" aria-hidden="true" />
            {t('reviews.leaveReview')}
          </Button>
          {target ? (
            <ReviewDrawer
              open={open}
              onOpenChange={setOpen}
              shiftId={vacancyData.id}
              reviewedUser={target}
            />
          ) : null}
        </>
      )}
    </section>
  )
})
