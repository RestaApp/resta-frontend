import { memo } from 'react'
import {
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  CookingPot,
  Clock,
  FileText,
  MapPin,
  Users,
} from 'lucide-react'
import type { TFunction } from 'i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import { formatMoney } from '@/features/feed/model/utils/formatting'
import { DetailRow } from './DetailRow'
import { TextCard } from './TextCard'
import { DETAIL_CARD_CLASS, ICON_WRAPPER_SECTION } from './constants'
import { formatServiceCategory } from './formatServiceCategory'

interface AboutVenue {
  bio?: string | null
  city?: string | null
  formatKey?: string | null
  cuisineTypes: string[]
}

interface DetailsTabProps {
  positionLabel: string
  specializations: string[]
  getSpecializationLabel: (value?: string | null) => string
  hasDate: boolean
  hasTime: boolean
  shiftDate?: string | null
  shiftTime?: string | null
  duration?: string | null
  location: string
  onOpenMap: () => void
  pay: string | number | null | undefined
  currency?: string | null
  paySuffix: string
  applicationsInfo: { value: string } | null
  description: string
  requirements: string
  aboutVenue: AboutVenue | null
  showVenueBadges: boolean
  getRestaurantFormatLabel: (value?: string | null) => string
  t: TFunction
}

export const DetailsTab = memo(
  ({
    positionLabel,
    specializations,
    getSpecializationLabel,
    hasDate,
    hasTime,
    shiftDate,
    shiftTime,
    duration,
    location,
    onOpenMap,
    pay,
    currency,
    paySuffix,
    applicationsInfo,
    description,
    requirements,
    aboutVenue,
    showVenueBadges,
    getRestaurantFormatLabel,
    t,
  }: DetailsTabProps) => {
    return (
      <>
        <Card className={DETAIL_CARD_CLASS}>
          <div className="space-y-4">
            {positionLabel ? (
              <DetailRow
                icon={Briefcase}
                iconVariant="section"
                label={t('common.position')}
                value={positionLabel}
              />
            ) : null}

            {specializations.length > 0 ? (
              <DetailRow
                icon={CookingPot}
                iconVariant="section"
                label={t('profile.specializationSection')}
                value={specializations.map(spec => getSpecializationLabel(spec)).join(', ')}
              />
            ) : null}

            {hasDate ? (
              <DetailRow
                icon={Calendar}
                iconVariant="section"
                label={t('common.date')}
                value={shiftDate}
              />
            ) : null}

            {hasTime ? (
              <DetailRow
                icon={Clock}
                iconVariant="section"
                label={t('shift.workTime')}
                value={shiftTime}
                subValue={
                  duration ? t('activity.durationWithValue', { value: duration }) : undefined
                }
              />
            ) : null}

            {location ? (
              <DetailRow
                icon={MapPin}
                iconVariant="section"
                label={t('common.location')}
                value={location}
                action={
                  <Button
                    onClick={onOpenMap}
                    variant="ghost"
                    size="sm"
                    className="mt-1 px-0 text-primary hover:underline"
                  >
                    {t('aria.viewOnMap')}
                  </Button>
                }
              />
            ) : null}

            <DetailRow
              icon={Banknote}
              iconVariant="section"
              label={t('shift.pay')}
              value={
                <span className="text-lg font-semibold text-primary">
                  {pay == null || Number(pay) === 0
                    ? t('shift.payNegotiable')
                    : `${formatMoney(Number(pay))} ${currency}`}
                </span>
              }
              subValue={pay != null && Number(pay) > 0 ? paySuffix : undefined}
            />

            {applicationsInfo ? (
              <DetailRow
                icon={Users}
                iconVariant="section"
                label={t('shift.applicationsCount')}
                value={applicationsInfo.value}
              />
            ) : null}
          </div>
        </Card>

        {description ? (
          <TextCard icon={FileText} title={t('common.description')} content={description} />
        ) : null}
        {requirements ? (
          <TextCard icon={FileText} title={t('common.requirements')} content={requirements} />
        ) : null}

        {aboutVenue ? (
          <Card className={DETAIL_CARD_CLASS}>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(ICON_WRAPPER_SECTION)} aria-hidden>
                <Building2 className="h-5 w-5 text-primary shrink-0" />
              </div>
              <h2 className="text-base font-medium text-foreground break-words">
                {t('common.aboutVenue')}
              </h2>
            </div>
            {aboutVenue.bio ? (
              <p className="text-sm text-muted-foreground mb-3">{aboutVenue.bio}</p>
            ) : null}
            {showVenueBadges ? (
              <div className="flex flex-wrap gap-2">
                {aboutVenue.city ? (
                  <Badge variant="tag" className="font-normal">
                    {aboutVenue.city}
                  </Badge>
                ) : null}
                {aboutVenue.formatKey ? (
                  <Badge variant="tag" className="font-normal">
                    {getRestaurantFormatLabel(aboutVenue.formatKey)}
                  </Badge>
                ) : null}
                {aboutVenue.cuisineTypes.length
                  ? aboutVenue.cuisineTypes.map(type => (
                      <Badge key={type} variant="tag" className="font-normal">
                        {t(`labels.cuisineType.${type}`, {
                          defaultValue: formatServiceCategory(type),
                        })}
                      </Badge>
                    ))
                  : null}
              </div>
            ) : null}
          </Card>
        ) : null}
      </>
    )
  }
)

DetailsTab.displayName = 'DetailsTab'
