import { memo, type MouseEvent } from 'react'
import { Calendar, MapPin, Star } from 'lucide-react'
import type { TFunction } from 'i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AVATAR_FALLBACK_CLASS, AVATAR_SM_CLASS } from '@/components/ui/avatar-styles'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/utils/cn'
import { formatExperienceText } from '@/shared/utils/experience'
import { formatUserDisplayName } from '@/shared/utils/userDisplayName'
import {
  PREVIEW_CARD_BELOW_TAGS_CLASS,
  PREVIEW_CARD_ACTION_BUTTON_CLASS,
  PREVIEW_CARD_STATS_CLASS,
  PREVIEW_CARD_TAGS_CLASS,
  PreviewCardLayout,
} from '@/components/ui/shift-card/PreviewCardLayout'
import {
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import type { ApplicationPreviewApiItem } from '@/services/api/shiftsApi'
import { resolveApplicantSpecializations } from '@/shared/shifts/resolveApplicantSpecializations'
import { getApplicationId, getApplicationStatus } from '@/shared/shifts/applicationStatus'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'

interface ApplicantPreviewCardProps {
  applicant: ApplicationPreviewApiItem
  fallbackCity?: string | null
  getEmployeePositionLabel: (value?: string | null) => string
  getSpecializationLabel: (value: string) => string
  onSelect: (userId: number, applicationId: number | null) => void
  t: TFunction
  variant?: 'default' | 'moderation' | 'catalog'
  onAccept?: (applicationId: number) => void
  isAccepting?: boolean
  acceptingApplicationId?: number | null
  onInvite?: () => void
}

const ACCEPTED_CARD_CLASS = 'ring-2 ring-primary/30 bg-primary/5'

const getApplicantName = (app: ApplicationPreviewApiItem, t: TFunction): string => {
  const user = app.user
  return formatUserDisplayName(
    user
      ? { ...user, full_name: app.full_name ?? user.full_name }
      : { full_name: app.full_name, name: app.full_name },
    t('common.user')
  )
}

const getApplicantInitial = (name: string): string => name.charAt(0).toUpperCase() || '?'

const applicantAvatar = (photoUrl: string | null, name: string) => (
  <Avatar className={AVATAR_SM_CLASS}>
    <AvatarImage src={photoUrl ?? undefined} alt={name} />
    <AvatarFallback className={AVATAR_FALLBACK_CLASS}>{getApplicantInitial(name)}</AvatarFallback>
  </Avatar>
)

const applicantTitleRow = (name: string, isAccepted: boolean, t: TFunction) => (
  <div className="flex flex-wrap items-center gap-2">
    <p className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>{name}</p>
    {isAccepted ? (
      <Badge variant="accepted" className="shrink-0">
        {t('shift.applicantSelected')}
      </Badge>
    ) : null}
  </div>
)

const ratingSummary = (
  hasRating: boolean,
  normalizedRating: number,
  reviewsCount: number | null,
  t: TFunction
) =>
  hasRating ? (
    <span className="inline-flex items-center gap-1">
      <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" aria-hidden />
      {t('shift.ownerReviewsSummary', {
        rating: normalizedRating.toFixed(1),
        count: reviewsCount ?? 0,
      })}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1">
      <Star className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" aria-hidden />
      {t('shift.applicantNoReviews')}
    </span>
  )

const ratingStars = (hasRating: boolean, normalizedRating: number, t: TFunction) => (
  <div
    className="flex items-center gap-1 text-xs text-muted-foreground"
    aria-label={t('common.rating')}
  >
    {hasRating ? (
      [0, 1, 2, 3, 4].map(i => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            normalizedRating >= i + 0.5
              ? 'fill-warning text-warning'
              : 'fill-muted text-muted-foreground/30'
          )}
        />
      ))
    ) : (
      <>
        <Star className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" aria-hidden />
        <span>{t('shift.applicantNoReviews')}</span>
      </>
    )}
  </div>
)

const APPLICANT_PREVIEW_MAX_TAGS = 3

const specializationBadges = (
  tags: string[],
  t: TFunction,
  className: string = PREVIEW_CARD_TAGS_CLASS
) => {
  if (tags.length === 0) return null

  const visibleTags = tags.slice(0, APPLICANT_PREVIEW_MAX_TAGS)
  const hiddenCount = tags.length - visibleTags.length

  return (
    <div className={className}>
      {visibleTags.map(tag => (
        <Badge key={tag} variant="tag">
          {tag}
        </Badge>
      ))}
      {hiddenCount > 0 ? (
        <Badge variant="tag" className="text-muted-foreground">
          {t('shift.applicantTagsMore', { count: hiddenCount })}
        </Badge>
      ) : null}
    </div>
  )
}

export const ApplicantPreviewCard = memo(
  ({
    applicant: app,
    fallbackCity,
    getEmployeePositionLabel,
    getSpecializationLabel,
    onSelect,
    t,
    variant = 'default',
    onAccept,
    isAccepting = false,
    acceptingApplicationId = null,
    onInvite,
  }: ApplicantPreviewCardProps) => {
    const user = app.user
    const name = getApplicantName(app, t)
    const photoUrl = user?.photo_url ?? user?.profile_photo_url ?? null

    const rawPosition = (
      app.position ??
      user?.employee_profile?.position ??
      user?.position ??
      ''
    ).trim()
    const position = rawPosition ? getEmployeePositionLabel(rawPosition) : t('common.notSpecified')

    const rawRating = app.average_rating ?? user?.average_rating
    const ratingValue = rawRating !== undefined && rawRating !== null ? Number(rawRating) : NaN
    const hasRating = Number.isFinite(ratingValue) && ratingValue > 0
    const normalizedRating = hasRating ? Math.min(5, Math.max(0, ratingValue)) : 0

    const rawReviews = app.total_reviews ?? user?.total_reviews
    const reviewsCount =
      rawReviews !== undefined && rawReviews !== null && Number.isFinite(Number(rawReviews))
        ? Math.max(0, Math.floor(Number(rawReviews)))
        : null

    const completedShiftsRaw = app.completed_shifts ?? user?.completed_shifts
    const completedShifts =
      completedShiftsRaw !== undefined &&
      completedShiftsRaw !== null &&
      Number.isFinite(Number(completedShiftsRaw))
        ? Math.max(0, Math.floor(Number(completedShiftsRaw)))
        : null

    const experienceYears = app.experience_years ?? user?.employee_profile?.experience_years
    const experienceLabel =
      experienceYears !== undefined && experienceYears !== null
        ? formatExperienceText(Number(experienceYears))
        : null

    const city = user?.city?.trim() || fallbackCity?.trim() || null

    const specializationTags = resolveApplicantSpecializations(app)
      .map(item => getSpecializationLabel(item))
      .filter(Boolean)

    const appId = getApplicationId(app)
    const appStatus = getApplicationStatus(app)
    const isAccepted = appStatus === 'accepted'
    const isRejected = appStatus === 'rejected'
    const userId = app.user_id || user?.id
    const isThisAccepting =
      isAccepting && typeof appId === 'number' && acceptingApplicationId === appId

    const handleSelect = () => {
      if (!userId) return
      onSelect(userId, appId)
    }

    const handleAccept = (event: MouseEvent) => {
      event.stopPropagation()
      if (typeof appId !== 'number' || !onAccept) return
      onAccept(appId)
    }

    const handleOpenProfile = (event: MouseEvent) => {
      event.stopPropagation()
      handleSelect()
    }

    const handleInvite = (event: MouseEvent) => {
      event.stopPropagation()
      onInvite?.()
    }

    if (variant === 'moderation' || variant === 'catalog') {
      const showHireAction =
        variant === 'moderation' && !isAccepted && !isRejected && typeof appId === 'number'

      return (
        <PreviewCardLayout
          interactive={Boolean(userId)}
          onActivate={handleSelect}
          ariaLabel={t('applicants.openProfileAria', { name, defaultValue: name })}
          className={cn(variant === 'moderation' && isAccepted && ACCEPTED_CARD_CLASS)}
          avatar={applicantAvatar(photoUrl, name)}
          actions={
            <>
              {showHireAction ? (
                <Button
                  type="button"
                  variant="gradient"
                  size="sm"
                  className={PREVIEW_CARD_ACTION_BUTTON_CLASS}
                  disabled={isAccepting}
                  loading={isThisAccepting}
                  onClick={handleAccept}
                >
                  {t('shift.hireShort')}
                </Button>
              ) : null}
              {variant === 'catalog' && onInvite ? (
                <Button
                  type="button"
                  variant="gradient"
                  size="sm"
                  className={PREVIEW_CARD_ACTION_BUTTON_CLASS}
                  onClick={handleInvite}
                >
                  {t('venueUi.staff.catalog.invite', { defaultValue: 'Пригласить' })}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={PREVIEW_CARD_ACTION_BUTTON_CLASS}
                onClick={handleOpenProfile}
              >
                {t('tabs.employee.profileShort')}
              </Button>
            </>
          }
        >
          {applicantTitleRow(name, variant === 'moderation' && isAccepted, t)}
          <p className={cn(SHIFT_CARD_SUB_CLASS, 'truncate')}>{position}</p>

          <div className={PREVIEW_CARD_STATS_CLASS} aria-label={t('common.rating')}>
            {ratingSummary(hasRating, normalizedRating, reviewsCount, t)}
            {variant === 'moderation' && completedShifts != null ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className={ICON_SM_CLASS} aria-hidden />
                {t('shift.venueCompletedShifts', { count: completedShifts })}
              </span>
            ) : null}
          </div>

          {specializationBadges(specializationTags, t)}
        </PreviewCardLayout>
      )
    }

    const belowContent =
      specializationTags.length > 0 || experienceLabel || city ? (
        <>
          {specializationBadges(specializationTags, t, PREVIEW_CARD_BELOW_TAGS_CLASS)}
          {experienceLabel || city ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {experienceLabel ? (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {experienceLabel}
                </span>
              ) : null}
              {city ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {city}
                </span>
              ) : null}
            </div>
          ) : null}
        </>
      ) : undefined

    return (
      <PreviewCardLayout
        interactive
        className={cn(isAccepted && ACCEPTED_CARD_CLASS)}
        ariaLabel={t('applicants.openProfileAria', { name, defaultValue: name })}
        onActivate={handleSelect}
        avatar={applicantAvatar(photoUrl, name)}
        below={belowContent}
      >
        {applicantTitleRow(name, isAccepted, t)}
        <p className={cn(SHIFT_CARD_SUB_CLASS, 'truncate')}>{position}</p>
        {ratingStars(hasRating, normalizedRating, t)}
      </PreviewCardLayout>
    )
  }
)

ApplicantPreviewCard.displayName = 'ApplicantPreviewCard'
