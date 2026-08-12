import { memo } from 'react'
import type { TFunction } from 'i18next'
import { Building2, Clock, Flame, MapPin, Star, Users } from 'lucide-react'
import type { Shift } from '@/shared/shifts/types'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'
import { formatMoney } from '@/shared/shifts/formatting'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/shared/utils/cn'
import {
  BODY_MUTED_CLASS,
  DISPLAY_PRICE_CLASS,
  FORMATTED_USER_TEXT_CLASS,
  SCREEN_TITLE_CLASS,
  SUBSECTION_TITLE_CLASS,
} from '@/components/ui/ui-patterns'
import { SHIFT_CARD_SUB_CLASS } from '@/components/ui/shift-card/shift-card-styles'
import {
  formatDistanceKm,
  stripVacancyPrefix,
  positionInitial,
} from '@/components/ui/shift-card/shift-card-utils'
import { DetailsVenueCard } from './DetailsVenueCard'
import {
  extractDurationHours,
  formatOwnerRating,
  formatOwnerReviewsCount,
  normalizeDuration,
  parseRequirementLines,
  splitLocationLines,
} from './detailsTabUtils'

interface DetailsTabProps {
  shift: Shift
  vacancyTitle: string
  positionLabel: string
  /** Показать строку позиции отдельно (когда заголовок — название вакансии, а не сама позиция). */
  showPositionLine?: boolean
  ownerDisplayName?: string
  ownerRating?: number | null
  ownerReviews?: number | null
  applicationsCount?: number | null
  showVenueCard?: boolean
  onOpenOwnerProfile?: () => void
  shiftDate?: string | null
  shiftTime?: string | null
  duration?: string | null
  locationPoints: string[]
  pay: string | number | null | undefined
  currency?: string | null
  hourlyRate: string | null
  description: string
  requirements: string
  t: TFunction
}

interface LabeledTextSectionProps {
  label: string
  text: string
}

const LabeledTextSection = ({ label, text }: LabeledTextSectionProps) => (
  <section className="flex flex-col gap-2 border-t border-border pt-4">
    <h2 className={SUBSECTION_TITLE_CLASS}>{label}</h2>
    <p className={cn(BODY_MUTED_CLASS, FORMATTED_USER_TEXT_CLASS)}>{text}</p>
  </section>
)

interface RequirementsSectionProps {
  label: string
  lines: string[]
}

const RequirementsSection = ({ label, lines }: RequirementsSectionProps) => (
  <section className="flex flex-col gap-2 border-t border-border pt-4">
    <h2 className={SUBSECTION_TITLE_CLASS}>{label}</h2>
    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
      {lines.map(line => (
        <li key={line} className={FORMATTED_USER_TEXT_CLASS}>
          {line}
        </li>
      ))}
    </ul>
  </section>
)

export const DetailsTab = memo(
  ({
    shift,
    vacancyTitle,
    positionLabel,
    showPositionLine = false,
    ownerDisplayName = '',
    ownerRating,
    ownerReviews,
    applicationsCount,
    showVenueCard = false,
    onOpenOwnerProfile,
    shiftDate,
    shiftTime,
    duration,
    locationPoints,
    pay,
    currency,
    hourlyRate,
    description,
    requirements,
    t,
  }: DetailsTabProps) => {
    const displayDuration = normalizeDuration(duration)
    const durationHours = extractDurationHours(duration)
    const durationLabel =
      durationHours != null
        ? t('shift.durationHours', { count: Math.round(durationHours) })
        : displayDuration
    const { street: locationStreet, city: locationCity } = splitLocationLines(
      locationPoints,
      shift.city
    )
    const distance = formatDistanceKm(shift.distanceKm)
    const isPayNegotiable = pay == null || Number(pay) === 0
    const payValue = isPayNegotiable ? t('shift.payNegotiable') : formatMoney(Number(pay))
    const payCurrency = isPayNegotiable ? '' : (currency ?? '')
    const schedule = [shiftDate, shiftTime].filter(Boolean).join(' • ')
    const compactTitle = stripVacancyPrefix(vacancyTitle || positionLabel || shift.position)
    const venueName = (shift.restaurant || ownerDisplayName || '').trim()
    const positionLineText = showPositionLine ? positionLabel.trim() : ''
    const avatarFallback = positionInitial(positionLabel || shift.position)
    const statusTagLabel =
      shift.statusTag === 'expired'
        ? t('activity.statusExpired', { defaultValue: 'Просрочена' })
        : null

    const ratingValue = formatOwnerRating(ownerRating)
    const reviewsCount = formatOwnerReviewsCount(ownerReviews)
    const ownerReviewsLabel =
      ratingValue != null
        ? t('shift.ownerReviewsSummary', {
            rating: ratingValue,
            count: reviewsCount ?? 0,
          })
        : null

    const requirementLines = parseRequirementLines(requirements)
    const resolvedApplicationsCount =
      typeof applicationsCount === 'number' && Number.isFinite(applicationsCount)
        ? applicationsCount
        : typeof shift.applicationsCount === 'number' && Number.isFinite(shift.applicationsCount)
          ? shift.applicationsCount
          : null
    const applicantsLabel =
      resolvedApplicationsCount != null && resolvedApplicationsCount > 0
        ? t('shift.applicantsLabel', { count: resolvedApplicationsCount })
        : null

    const canShowVenueCard = showVenueCard && venueName && onOpenOwnerProfile

    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          {shift.urgent || statusTagLabel ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              {shift.urgent ? (
                <span className="inline-flex w-fit items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 font-mono-resta text-xs font-bold uppercase tracking-wider text-primary">
                  <Flame className={ICON_SM_CLASS} aria-hidden />
                  {t('shift.urgentBadge', { defaultValue: 'URGENT' })}
                </span>
              ) : null}
              {statusTagLabel ? (
                <Badge variant="rej" className={cn('px-3 py-1', !shift.urgent && 'ml-auto')}>
                  {statusTagLabel}
                </Badge>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className={cn(SCREEN_TITLE_CLASS, 'whitespace-normal leading-tight')}>
                {compactTitle}
              </h1>
              {positionLineText ? (
                <p
                  className={cn(
                    SHIFT_CARD_SUB_CLASS,
                    'overflow-visible whitespace-normal text-clip text-sm font-medium text-foreground'
                  )}
                >
                  {positionLineText}
                </p>
              ) : null}
            </div>

            <div className="flex max-w-36 flex-col items-end gap-1 text-right">
              <div
                className={cn(
                  isPayNegotiable
                    ? 'max-w-28 text-sm font-semibold leading-snug text-foreground'
                    : 'whitespace-nowrap',
                  !isPayNegotiable && cn(DISPLAY_PRICE_CLASS, 'price-xl')
                )}
              >
                {payValue}
                {payCurrency ? (
                  <span className="ml-1 font-mono-resta text-base font-semibold text-muted-foreground">
                    {payCurrency}
                  </span>
                ) : null}
              </div>
              {durationLabel ? (
                <p className="text-xs leading-snug text-muted-foreground">{durationLabel}</p>
              ) : null}
              {hourlyRate ? (
                <p className="text-xs leading-snug text-primary">
                  {t('shift.hourlyRateApprox', {
                    rate: hourlyRate,
                    currency: currency ?? 'BYN',
                  })}
                </p>
              ) : null}
            </div>
          </div>

          {ownerReviewsLabel ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className={cn(ICON_SM_CLASS, 'fill-primary text-primary')} aria-hidden />
                {ownerReviewsLabel}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          {venueName ? (
            <div className="flex min-w-0 items-start gap-3">
              <Building2
                className={cn(ICON_SM_CLASS, 'mt-0.5 shrink-0 text-muted-foreground')}
                aria-hidden
              />
              <span className="line-clamp-2 min-w-0 text-sm font-semibold text-foreground">
                {venueName}
              </span>
            </div>
          ) : null}

          {schedule ? (
            <div className="flex items-start gap-3">
              <Clock className={cn(ICON_SM_CLASS, 'mt-0.5 text-muted-foreground')} aria-hidden />
              <span className="text-sm font-semibold text-foreground">{schedule}</span>
            </div>
          ) : null}

          {locationStreet ? (
            <div className="flex items-start gap-3">
              <MapPin className={cn(ICON_SM_CLASS, 'mt-0.5 text-muted-foreground')} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{locationStreet}</p>
                {locationCity ? (
                  <p className="text-sm text-muted-foreground">{locationCity}</p>
                ) : null}
                {distance ? <p className="mt-0.5 text-sm text-primary">{distance}</p> : null}
              </div>
            </div>
          ) : null}

          {applicantsLabel ? (
            <div className="flex items-start gap-3">
              <Users className={cn(ICON_SM_CLASS, 'mt-0.5 text-muted-foreground')} aria-hidden />
              <span className="text-sm font-semibold text-foreground">{applicantsLabel}</span>
            </div>
          ) : null}
        </div>

        {/* Карточка владельца — выше требований/описания, чтобы длинный текст не «топил» её вниз (#10). */}
        {canShowVenueCard ? (
          <DetailsVenueCard
            name={venueName}
            photoUrl={shift.photoUrl}
            avatarFallback={avatarFallback}
            ratingLabel={ownerReviewsLabel}
            onOpen={onOpenOwnerProfile}
            t={t}
          />
        ) : null}

        {requirementLines.length > 0 ? (
          <RequirementsSection label={t('common.requirements')} lines={requirementLines} />
        ) : null}

        {description ? (
          <LabeledTextSection label={t('common.description')} text={description} />
        ) : null}
      </div>
    )
  }
)

DetailsTab.displayName = 'DetailsTab'
