import { memo } from 'react'
import type { TFunction } from 'i18next'
import type { Shift } from '@/features/feed/model/types'
import { formatMoney } from '@/features/feed/model/utils/formatting'
import { Card } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import {
  BODY_MUTED_CLASS,
  DISPLAY_PRICE_CLASS,
  PROFILE_SECTION_LABEL_CLASS,
  SCREEN_TITLE_CLASS,
} from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_LOGO_CLASS,
  SHIFT_CARD_SUB_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'

interface DetailsTabProps {
  shift: Shift
  vacancyTitle: string
  positionLabel: string
  shiftDate?: string | null
  shiftTime?: string | null
  duration?: string | null
  locationPoints: string[]
  pay: string | number | null | undefined
  currency?: string | null
  hourlyRate: string | null
  description: string
  requirements: string
  managerName?: string | null
  t: TFunction
}

const formatDistanceKm = (distanceKm?: number | null): string | null => {
  if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm <= 0) return null
  const value = distanceKm < 10 ? Math.round(distanceKm * 10) / 10 : Math.round(distanceKm)
  return `${String(value).replace('.', ',')} км`
}

const normalizeDuration = (duration?: string | null): string | null => {
  const value = duration?.trim().replace(/\.$/, '') ?? ''
  return value || null
}

const positionInitial = (position: string): string => {
  const normalized = position.trim()
  return (normalized[0] ?? 'R').toUpperCase()
}

const stripVacancyPrefix = (title: string): string => {
  return title
    .replace(/^вакансия:\s*/i, '')
    .replace(/^(?:\s|🔥)+/u, '')
    .trim()
}

interface LabeledTextSectionProps {
  label: string
  text: string
}

const LabeledTextSection = ({ label, text }: LabeledTextSectionProps) => (
  <div className="flex flex-col gap-2">
    <p className={PROFILE_SECTION_LABEL_CLASS}>{label}</p>
    <p className={cn(BODY_MUTED_CLASS, 'leading-relaxed')}>{text}</p>
  </div>
)

export const DetailsTab = memo(
  ({
    shift,
    vacancyTitle,
    positionLabel,
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
    const displayLocation = locationPoints[0] ?? shift.location ?? ''
    const distance = formatDistanceKm(shift.distanceKm)
    const payValue =
      pay == null || Number(pay) === 0 ? t('shift.payNegotiable') : formatMoney(Number(pay))
    const payCurrency = pay == null || Number(pay) === 0 ? '' : (currency ?? '')
    const schedule = [shiftDate, shiftTime].filter(Boolean).join(' · ')
    const compactTitle = stripVacancyPrefix(vacancyTitle || positionLabel || shift.position)
    const compactSubtitle = shift.restaurant || positionLabel || ''

    return (
      <div className="flex flex-col gap-3">
        {shift.urgent ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              🔥 SOS
            </span>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className={cn(SCREEN_TITLE_CLASS, 'line-clamp-2 leading-tight')}>{compactTitle}</h1>
            <div className="flex min-w-0 items-center gap-2">
              <div className={SHIFT_CARD_LOGO_CLASS}>
                {positionInitial(positionLabel || shift.position)}
              </div>
              <p className={cn(SHIFT_CARD_SUB_CLASS, 'truncate')}>{compactSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={cn(DISPLAY_PRICE_CLASS, 'price-xl')}>
              {payValue}
              {payCurrency ? (
                <span className="ml-1 text-base font-semibold text-muted-foreground">
                  {payCurrency}
                </span>
              ) : null}
            </div>
            <div className="min-w-0 text-sm">
              <p className="text-muted-foreground">
                {t('common.payPerShift', { defaultValue: 'за смену' })}
                {displayDuration ? ` ${displayDuration}` : ''}
              </p>
              {hourlyRate ? (
                <p className="text-primary">
                  ≈ {hourlyRate} {currency}/час
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <Card padding="md" className="dark:shadow-none">
          <div className="flex flex-col gap-1">
            {schedule ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span aria-hidden>⏱</span>
                  <span className="truncate text-sm font-semibold text-foreground">{schedule}</span>
                </div>
                {displayDuration ? (
                  <span className="shrink-0 text-sm text-muted-foreground">{displayDuration}</span>
                ) : null}
              </div>
            ) : null}
            {displayLocation ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span aria-hidden>📍</span>
                  <span className="truncate text-sm font-semibold text-foreground">
                    {displayLocation}
                  </span>
                </div>
                {distance ? (
                  <span className="shrink-0 text-sm text-primary">{distance}</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </Card>

        {requirements ? (
          <LabeledTextSection label={t('common.requirements')} text={requirements} />
        ) : null}

        {description ? (
          <LabeledTextSection label={t('common.description')} text={description} />
        ) : null}
      </div>
    )
  }
)

DetailsTab.displayName = 'DetailsTab'
