import { memo, useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MapPin,
  Clock,
  DollarSign,
  FileText,
  CalendarDays,
  X,
  Users,
  Briefcase,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Drawer, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '@/features/feed/model/types'
import { useLabels } from '@/shared/i18n/hooks'
import { useShiftDetails } from '@/features/feed/model/hooks/useShiftDetails'
import { formatReviews } from '@/features/feed/model/utils/formatting'
import { useCurrentUserId } from '@/features/feed/model/hooks/useCurrentUserId'
import { StatusPill, UrgentPill, type ShiftStatus } from './StatusPill'

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
}

interface DetailRowProps {
  icon: LucideIcon
  iconColor?: string
  label: string
  value: string | ReactNode
  subValue?: string | ReactNode
  action?: ReactNode
}

const DetailRow = memo(
  ({ icon: Icon, iconColor = 'text-primary', label, value, subValue, action }: DetailRowProps) => (
    <div className="flex items-start gap-3">
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-muted-foreground mb-1 break-words">{label}</div>
        <div
          className="text-[14px] font-medium break-words"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        >
          {value}
        </div>
        {subValue ? (
          <div
            className="text-[12px] text-muted-foreground mt-1 break-words"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            {subValue}
          </div>
        ) : null}
        {action}
      </div>
    </div>
  )
)
DetailRow.displayName = 'DetailRow'

interface TextCardProps {
  icon: LucideIcon
  title: string
  content: string
}

const TextCard = memo(({ icon: Icon, title, content }: TextCardProps) => (
  <Card className="p-4">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-5 h-5 text-primary flex-shrink-0" />
      <h2 className="text-[16px] font-medium break-words">{title}</h2>
    </div>
    <div
      className="text-[14px] text-muted-foreground leading-relaxed whitespace-pre-line break-words"
      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
    >
      {content}
    </div>
  </Card>
))
TextCard.displayName = 'TextCard'

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
  } = props

  const { t } = useTranslation()
  const { getRestaurantFormatLabel } = useLabels()
  const {
    restaurantInfo,
    aboutVenue,
    hourlyRate,
    shiftTypeLabel,
    vacancyTitle,
    positionLabel,
    specializationLabel,
    applicationsInfo,
  } = useShiftDetails(shift, vacancyData)

  const currentUserId = useCurrentUserId()
  const isOwner = Boolean(currentUserId && shift?.ownerId && shift.ownerId === currentUserId)

  const [coverMessage, setCoverMessage] = useState('')

  const description = vacancyData?.description?.trim() ?? ''
  const requirements = vacancyData?.requirements?.trim() ?? ''
  const location = shift?.location?.trim() ?? ''

  const showVenueBadges = Boolean(
    aboutVenue && (aboutVenue.city || aboutVenue.formatKey || aboutVenue.cuisineTypes.length > 0)
  )

  const appStatus: ShiftStatus =
    vacancyData?.my_application?.status ?? shift?.applicationStatus ?? null
  const isAccepted = appStatus === 'accepted'
  const isRejected = appStatus === 'rejected'

  const paySuffix = (() => {
    if (!shift) return t('common.payPerShift')
    const base = shift.payPeriod === 'month' ? t('common.payPerMonth') : t('common.payPerShift')
    if (!hourlyRate) return base
    return `${base} (${hourlyRate} ${shift.currency}/час)`
  })()

  const handleClose = useCallback(() => {
    setCoverMessage('')
    onClose()
  }, [onClose])

  const handleApply = useCallback(async () => {
    if (!shift) return
    try {
      await onApply(shift.id, coverMessage.trim() || undefined)
      handleClose()
    } catch {
      // toast/ошибка уже обрабатываются выше по стеку
    }
  }, [shift, coverMessage, onApply, handleClose])

  const handleCancel = useCallback(async () => {
    if (!shift || isRejected) return
    const appId = applicationId ?? shift.applicationId ?? vacancyData?.my_application?.id ?? null
    try {
      await onCancel(appId, shift.id)
      handleClose()
    } catch {
      // toast/ошибка уже обрабатываются выше по стеку
    }
  }, [shift, applicationId, vacancyData, onCancel, handleClose, isRejected])

  const handleOpenMap = useCallback(() => {
    // TODO: открыть карту
  }, [])

  if (!shift) return null

  return (
    <Drawer
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose()
      }}
    >
      <DrawerHeader className="pb-2">
        <div className="flex items-center justify-between mb-2 gap-2">
          <DrawerTitle className="text-xl break-words flex-1 min-w-0">{vacancyTitle}</DrawerTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            aria-label={t('common.close')}
            className="min-w-[44px] min-h-[44px] p-2 hover:text-primary flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{shift.restaurant}</Badge>

          {shift.urgent ? (
            // Важно: "Срочно" брендовый, чтобы не конфликтовать с rejected/destructive
            <UrgentPill />
          ) : null}

          {shiftTypeLabel ? (
            <Badge variant="outline" className="gap-1">
              <Briefcase className="w-3 h-3" />
              {shiftTypeLabel}
            </Badge>
          ) : null}

          {/* Статус заявки — в стиле проекта */}
          <StatusPill status={appStatus} />
        </div>
      </DrawerHeader>

      <div className="overflow-y-auto px-4 pb-4 space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center text-3xl border border-white/10">
              {shift.logo}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold mb-1 break-words">{shift.restaurant}</h2>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {shift.rating > 0 ? <span>⭐ {shift.rating.toFixed(1)}</span> : null}
                {restaurantInfo?.reviews ? (
                  <>
                    <span>•</span>
                    <span>
                      {restaurantInfo.reviews} {formatReviews(restaurantInfo.reviews)}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            {positionLabel ? (
              <DetailRow
                icon={Briefcase}
                iconColor="text-indigo-500"
                label={t('common.position')}
                value={positionLabel}
                subValue={
                  specializationLabel
                    ? `${t('profileFields.specialization')}: ${specializationLabel}`
                    : undefined
                }
              />
            ) : null}

            <DetailRow
              icon={CalendarDays}
              iconColor="text-purple-500"
              label={t('common.date')}
              value={shift.date}
            />

            <DetailRow
              icon={Clock}
              iconColor="text-blue-500"
              label={t('shift.workTime')}
              value={shift.time}
              subValue={
                shift.duration
                  ? t('activity.durationWithValue', { value: shift.duration })
                  : undefined
              }
            />

            {location ? (
              <DetailRow
                icon={MapPin}
                iconColor="text-primary"
                label={t('common.location')}
                value={location}
                action={
                  <Button
                    onClick={handleOpenMap}
                    variant="ghost"
                    size="sm"
                    className="text-[12px] text-primary hover:underline mt-1 px-0"
                  >
                    {t('aria.viewOnMap')}
                  </Button>
                }
              />
            ) : null}

            <DetailRow
              icon={DollarSign}
              iconColor="text-primary"
              label={t('shift.pay')}
              value={
                <span className="text-[18px] font-semibold text-primary">
                  {shift.pay} {shift.currency}
                </span>
              }
              subValue={paySuffix}
            />

            {applicationsInfo ? (
              <DetailRow
                icon={Users}
                iconColor="text-green-500"
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
          <Card className="p-4">
            <h2 className="text-[16px] font-medium mb-3">{t('common.aboutVenue')}</h2>

            {aboutVenue.bio ? (
              <p className="text-[12px] text-muted-foreground mb-2">{aboutVenue.bio}</p>
            ) : null}

            {showVenueBadges ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {aboutVenue.city ? (
                  <Badge variant="outline" className="text-[11px]">
                    {aboutVenue.city}
                  </Badge>
                ) : null}

                {aboutVenue.formatKey ? (
                  <Badge variant="outline" className="text-[11px]">
                    {getRestaurantFormatLabel(aboutVenue.formatKey)}
                  </Badge>
                ) : null}

                {aboutVenue.cuisineTypes.length ? (
                  aboutVenue.cuisineTypes.map(type => (
                    <Badge key={type} variant="outline" className="text-[11px]">
                      {type}
                    </Badge>
                  ))
                ) : null}
              </div>
            ) : null}
          </Card>
        ) : null}

        {!isOwner && !isApplied && !isAccepted && !isRejected ? (
          <Card className="p-4">
            <label
              className="text-[12px] text-muted-foreground mb-2 block"
              htmlFor="shift-cover-message"
            >
              {t('shift.coverMessage')}
            </label>
            <textarea
              id="shift-cover-message"
              value={coverMessage}
              onChange={e => setCoverMessage(e.target.value)}
              placeholder={t('shift.coverMessagePlaceholder')}
              className="w-full min-h-[88px] px-3 py-2 text-[14px] rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
              maxLength={2000}
            />
          </Card>
        ) : null}
      </div>

      <DrawerFooter className="border-t border-border">
        {isOwner ? null : (
          <div className="flex gap-3">
            {/* Не показываем метку "подтверждена" в футере */}
            {isAccepted || isRejected ? null : isApplied ? (
              <Button
                onClick={handleCancel}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                {isLoading ? t('shift.cancelling') : t('shift.cancelApplication')}
              </Button>
            ) : (
              <Button
                onClick={handleApply}
                disabled={isLoading}
                className="flex-1 gradient-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('shift.sending') : t('shift.apply')}
              </Button>
            )}
          </div>
        )}
      </DrawerFooter>
    </Drawer>
  )
})

ShiftDetailsScreen.displayName = 'ShiftDetailsScreen'
