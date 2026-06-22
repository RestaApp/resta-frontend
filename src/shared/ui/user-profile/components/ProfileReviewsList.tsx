import { memo, useMemo } from 'react'
import { Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'
import { useGetReviewsQuery, type ReviewItem } from '@/services/api/reviewsApi'

const MAX_VISIBLE = 5

const ReadOnlyStars = memo(function ReadOnlyStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating}`}>
      {[0, 1, 2, 3, 4].map(index => (
        <Star
          key={index}
          className={cn(
            'h-3 w-3',
            index < Math.round(rating) ? 'fill-current text-warning' : 'text-muted-foreground/30'
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  )
})

const ReviewRow = memo(function ReviewRow({ review }: { review: ReviewItem }) {
  const name = review.reviewer_name || review.reviewer?.full_name || review.reviewer?.name || ''
  const date = review.created_at ? new Date(review.created_at).toLocaleDateString() : ''
  const photo = review.anonymous ? null : review.reviewer?.profile_photo_url

  return (
    <Card className={cn(SHIFT_CARD_CLASS, 'flex flex-col gap-1.5')}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            {photo ? <AvatarImage src={photo} alt={name} /> : null}
            <AvatarFallback className="bg-elevated text-xs text-foreground">
              {name.slice(0, 1).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>{name}</div>
            {date ? <div className={SHIFT_CARD_SUB_CLASS}>{date}</div> : null}
          </div>
        </div>
        <ReadOnlyStars rating={review.rating} />
      </div>
      {review.comment ? <p className="text-sm text-muted-foreground">{review.comment}</p> : null}
    </Card>
  )
})

/**
 * Лента отзывов о пользователе (GET /api/v1/reviews).
 * ⚠️ Текущий бэкенд не фильтрует по reviewed_id — дофильтровываем по `reviewed.id`
 * на клиенте (см. HANDOFF.md). При пустом списке ничего не рендерим.
 */
export const ProfileReviewsList = memo(function ProfileReviewsList({ userId }: { userId: number }) {
  const { data } = useGetReviewsQuery({ reviewed_id: userId })

  const reviews = useMemo(() => {
    const items = data?.data ?? []
    return items
      .filter(review => review.reviewed?.id === userId && (review.comment || review.rating > 0))
      .slice()
      .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
      .slice(0, MAX_VISIBLE)
  }, [data, userId])

  if (reviews.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {reviews.map(review => (
        <ReviewRow key={review.id} review={review} />
      ))}
    </div>
  )
})
