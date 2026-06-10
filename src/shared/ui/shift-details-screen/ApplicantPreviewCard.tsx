import { memo, type KeyboardEvent, type MouseEvent } from 'react'
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
  SHIFT_CARD_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import type { ApplicationPreviewApiItem } from '@/services/api/shiftsApi'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'

interface ApplicantPreviewCardProps {
  applicant: ApplicationPreviewApiItem
  fallbackCity?: string | null
  getEmployeePositionLabel: (value?: string | null) => string
  getSpecializationLabel: (value: string) => string
  onSelect: (userId: number, applicationId: number | null) => void
  t: TFunction
  variant?: 'default' | 'moderation'
  onAccept?: (applicationId: number) => void
  isAccepting?: boolean
  acceptingApplicationId?: number | null
}

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

    const specializationTags = (app.specializations ?? [])
      .map(item => getSpecializationLabel(item))
      .filter(Boolean)

    const appId = app.shift_application_id ?? app.id ?? null
    const appStatus = app.shift_application_status ?? app.status ?? 'pending'
    const isAccepted = appStatus === 'accepted'
    const isRejected = appStatus === 'rejected'
    const userId = app.user_id || user?.id
    const isThisAccepting =
      isAccepting && typeof appId === 'number' && acceptingApplicationId === appId

    const handleSelect = () => {
      if (!userId) return
      onSelect(userId, appId)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (variant === 'moderation') return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      handleSelect()
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

    if (variant === 'moderation') {
      return (
        <div className={cn(SHIFT_CARD_CLASS, isAccepted && 'ring-2 ring-primary/30 bg-primary/5')}>
          <div className="flex gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <Avatar className={AVATAR_SM_CLASS}>
                <AvatarImage src={photoUrl ?? undefined} alt={name} />
                <AvatarFallback className={AVATAR_FALLBACK_CLASS}>
                  {getApplicantInitial(name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>{name}</p>
                  {isAccepted ? (
                    <Badge variant="accepted" className="shrink-0">
                      {t('shift.applicantSelected')}
                    </Badge>
                  ) : null}
                </div>
                <p className={cn(SHIFT_CARD_SUB_CLASS, 'truncate')}>{position}</p>

                <div
                  className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
                  aria-label={t('common.rating')}
                >
                  {hasRating ? (
                    <span className="inline-flex items-center gap-1">
                      <Star
                        className="h-3.5 w-3.5 shrink-0 fill-warning text-warning"
                        aria-hidden
                      />
                      {t('shift.ownerReviewsSummary', {
                        rating: normalizedRating.toFixed(1),
                        count: reviewsCount ?? 0,
                      })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" aria-hidden />
                      {t('shift.applicantNoReviews')}
                    </span>
                  )}
                  {completedShifts != null ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className={ICON_SM_CLASS} aria-hidden />
                      {t('shift.venueCompletedShifts', { count: completedShifts })}
                    </span>
                  ) : null}
                </div>

                {specializationTags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {specializationTags.map(tag => (
                      <Badge key={tag} variant="tag">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex w-[4.75rem] shrink-0 flex-col justify-center gap-2 self-stretch">
              {!isAccepted && !isRejected && typeof appId === 'number' ? (
                <Button
                  type="button"
                  variant="gradient"
                  size="sm"
                  className="h-9 w-full px-2 text-xs"
                  disabled={isAccepting}
                  loading={isThisAccepting}
                  onClick={handleAccept}
                >
                  {t('shift.hireShort')}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full px-2 text-xs"
                onClick={handleOpenProfile}
              >
                {t('tabs.employee.profileShort')}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={t('applicants.openProfileAria', { name, defaultValue: name })}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        className={cn(
          SHIFT_CARD_CLASS,
          'ui-density-stack-sm cursor-pointer outline-none transition-all duration-200 active:scale-[0.99] hover:border-border/80 focus-visible:ring-2 focus-visible:ring-ring',
          isAccepted && 'ring-2 ring-primary/30 bg-primary/5'
        )}
      >
        <div className="flex items-start gap-3">
          <Avatar className={AVATAR_SM_CLASS}>
            <AvatarImage src={photoUrl ?? undefined} alt={name} />
            <AvatarFallback className={AVATAR_FALLBACK_CLASS}>
              {getApplicantInitial(name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">{name}</p>
              {isAccepted ? (
                <Badge variant="accepted" className="shrink-0">
                  {t('shift.applicantSelected')}
                </Badge>
              ) : null}
            </div>
            <p className="truncate text-xs text-muted-foreground">{position}</p>
            <div
              className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"
              aria-label={t('common.rating')}
            >
              {hasRating ? (
                <>
                  {[0, 1, 2, 3, 4].map(i => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        normalizedRating >= i + 0.5
                          ? 'fill-warning text-warning'
                          : 'fill-muted text-muted-foreground/30'
                      )}
                    />
                  ))}
                </>
              ) : (
                <>
                  <Star className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  <span>{t('shift.applicantNoReviews')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {specializationTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {specializationTags.map(tag => (
              <Badge key={tag} variant="tag">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

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
      </div>
    )
  }
)

ApplicantPreviewCard.displayName = 'ApplicantPreviewCard'
