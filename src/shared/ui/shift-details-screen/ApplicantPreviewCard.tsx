import { memo, type KeyboardEvent } from 'react'
import { Calendar, ChevronRight, MapPin, Star } from 'lucide-react'
import type { TFunction } from 'i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AVATAR_FALLBACK_CLASS, AVATAR_SM_CLASS } from '@/components/ui/avatar-styles'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/shared/utils/cn'
import { formatExperienceText } from '@/shared/utils/experience'
import { formatUserDisplayName } from '@/shared/utils/userDisplayName'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_INTERACTIVE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import type { ApplicationPreviewApiItem } from '@/services/api/shiftsApi'

interface ApplicantPreviewCardProps {
  applicant: ApplicationPreviewApiItem
  fallbackCity?: string | null
  getEmployeePositionLabel: (value?: string | null) => string
  getSpecializationLabel: (value: string) => string
  onSelect: (userId: number, applicationId: number | null) => void
  t: TFunction
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

    const rawRating = app.average_rating
    const ratingValue = rawRating !== undefined && rawRating !== null ? Number(rawRating) : NaN
    const hasRating = Number.isFinite(ratingValue) && ratingValue > 0
    const normalizedRating = Math.min(5, Math.max(0, ratingValue))

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
    const userId = app.user_id || user?.id

    const handleSelect = () => {
      if (!userId) return
      onSelect(userId, appId)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      handleSelect()
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
          SHIFT_CARD_INTERACTIVE_CLASS,
          'ui-density-stack-sm',
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
            <div className="flex items-start gap-2">
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
              <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            </div>
          </div>
        </div>

        {specializationTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {specializationTags.map(tag => (
              <Badge key={tag} variant="tag" className="font-normal">
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
