import { memo, useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MapPin,
  Clock,
  Banknote,
  FileText,
  CalendarDays,
  Users,
  Briefcase,
  Building2,
  Star,
  X,
  Check,
  ChefHat,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerCloseButton,
} from '@/components/ui/drawer'
import { Tabs } from '@/components/ui/tabs'
import { UserProfileDrawer } from '@/features/profile/ui/UserProfileDrawer'
import {
  type VacancyApiItem,
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
} from '@/services/api/shiftsApi'
import type { Shift } from '@/features/feed/model/types'
import { useLabels } from '@/shared/i18n/hooks'
import { useShiftDetails } from '@/features/feed/model/hooks/useShiftDetails'
import { useCurrentUserId } from '@/features/feed/model/hooks/useCurrentUserId'
import { useToast } from '@/hooks/useToast'
import { triggerHapticFeedback } from '@/utils/haptics'
import { normalizeApiError } from '@/features/feed/model/utils/apiErrors'
import { cn } from '@/utils/cn'
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
  /** Section-level rows get a soft tinted icon container; meta (date/time/location) stay neutral */
  iconVariant?: 'meta' | 'section'
  label: string
  value: string | ReactNode
  subValue?: string | ReactNode
  action?: ReactNode
}

const ICON_WRAPPER_SECTION = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10'

const DetailRow = memo(
  ({
    icon: Icon,
    iconColor = 'text-muted-foreground',
    iconVariant = 'meta',
    label,
    value,
    subValue,
    action,
  }: DetailRowProps) => (
    <div className="flex items-start gap-3">
      {iconVariant === 'section' ? (
        <div className={cn(ICON_WRAPPER_SECTION, 'mt-0.5')} aria-hidden>
          <Icon className="h-5 w-5 text-primary shrink-0" />
        </div>
      ) : (
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColor)} />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground mb-0.5 break-words">{label}</div>
        <div
          className="text-sm font-medium text-foreground break-words"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        >
          {value}
        </div>
        {subValue ? (
          <div
            className="text-xs text-muted-foreground mt-0.5 break-words"
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

const DETAIL_CARD_CLASS =
  'p-4 rounded-lg border border-border bg-card shadow-sm dark:shadow-none'

const TextCard = memo(({ icon: Icon, title, content }: TextCardProps) => (
  <Card className={DETAIL_CARD_CLASS}>
    <div className="flex items-center gap-2 mb-2">
      <div className={cn(ICON_WRAPPER_SECTION)} aria-hidden>
        <Icon className="h-5 w-5 text-primary shrink-0" />
      </div>
      <h2 className="text-base font-medium text-foreground break-words">{title}</h2>
    </div>
    <div
      className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line break-words"
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
  const { getRestaurantFormatLabel, getEmployeePositionLabel, getSpecializationLabel } = useLabels()
  const {
    aboutVenue,
    hourlyRate,
    shiftTypeLabel,
    vacancyTitle,
    positionLabel,
    specializations,
    applicationsInfo,
  } = useShiftDetails(shift, vacancyData)

  const currentUserId = useCurrentUserId()
  const isOwner = Boolean(
    shift?.isMine || (currentUserId && shift?.ownerId && shift.ownerId === currentUserId)
  )

  const { showToast } = useToast()
  const [acceptApplication] = useAcceptApplicationMutation()
  const [rejectApplication] = useRejectApplicationMutation()

  const [coverMessage, setCoverMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'applicants' | 'details'>('applicants')
  const [selectedApplicantId, setSelectedApplicantId] = useState<number | null>(null)
  const [selectedApplicantApplicationId, setSelectedApplicantApplicationId] = useState<number | null>(
    null
  )
  const [moderating, setModerating] = useState<{ id: number; action: 'accept' | 'reject' } | null>(
    null
  )

  const description = vacancyData?.description?.trim() ?? ''
  const requirements = vacancyData?.requirements?.trim() ?? ''
  const location = shift?.location?.trim() ?? ''

  const applicants = vacancyData?.applications_preview ?? []
  const showTabs = isOwner && applicants.length > 0
  const applicationsCount = vacancyData?.applications_count

  const selectedApp = applicants.find(
    a =>
      (a.shift_application_id ?? a.id) === selectedApplicantApplicationId
  )
  const selectedAppStatus =
    selectedApp?.shift_application_status ?? selectedApp?.status ?? 'pending'
  const canModerateSelected =
    isOwner &&
    typeof selectedApplicantApplicationId === 'number' &&
    (selectedAppStatus === 'pending' || selectedAppStatus === 'accepted')

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
    if (!location) return

    const encodedLocation = encodeURIComponent(location)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const nativeMapUrl = isIOS
      ? `maps://?q=${encodedLocation}`
      : `geo:0,0?q=${encodedLocation}`
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`

    // Нативная схема даёт системе выбрать установленное приложение карт.
    window.location.href = nativeMapUrl

    // Если нативная схема недоступна — откроем web-карту.
    window.setTimeout(() => {
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
    }, 600)
  }, [location])

  const extractModerationMessage = useCallback((result: unknown): string | undefined => {
    const r = result as { message?: string; data?: { message?: string } } | null
    return r?.message ?? r?.data?.message
  }, [])

  const handleAcceptApplication = useCallback(
    async (id: number) => {
      try {
        setModerating({ id, action: 'accept' })
        triggerHapticFeedback('light')
        const result = await acceptApplication({
          applicationId: id,
          shiftId: shift?.id,
        }).unwrap()
        showToast(
          extractModerationMessage(result) ?? t('shift.applicationAccepted'),
          'success'
        )
      } catch (e) {
        const err = normalizeApiError(e, t('shift.acceptApplicationError'), t)
        showToast(err.message, 'error')
        throw err
      } finally {
        setModerating(null)
      }
    },
    [acceptApplication, extractModerationMessage, shift?.id, showToast, t]
  )

  const handleRejectApplication = useCallback(
    async (id: number) => {
      try {
        setModerating({ id, action: 'reject' })
        triggerHapticFeedback('light')
        const result = await rejectApplication({
          applicationId: id,
          shiftId: shift?.id,
        }).unwrap()
        showToast(
          extractModerationMessage(result) ?? t('shift.applicationRejected'),
          'success'
        )
      } catch (e) {
        const err = normalizeApiError(e, t('shift.rejectApplicationError'), t)
        showToast(err.message, 'error')
        throw err
      } finally {
        setModerating(null)
      }
    },
    [extractModerationMessage, rejectApplication, shift?.id, showToast, t]
  )

  if (!shift) return null

  return (
    <Drawer
      open={isOpen}
      onOpenChange={open => {
        if (!open) handleClose()
      }}
    >
      <div
        className="flex flex-col rounded-t-2xl bg-background min-h-0 shrink-0"
        style={{ height: 'calc(85vh - 52px)' }}
      >
        <DrawerHeader className="pb-4 pt-1 border-b border-border shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <DrawerTitle className="text-xl font-semibold break-words capitalize text-foreground">
                {vacancyTitle}
              </DrawerTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {[shiftTypeLabel, shift.date, shift.time].filter(Boolean).join(' · ')}
              </p>
            </div>
            <DrawerCloseButton onClick={onClose} ariaLabel={t('common.close')} />
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-3">
            {shift.urgent ? <UrgentPill /> : null}
            <StatusPill status={appStatus} />
          </div>
        </DrawerHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-5 pt-4 space-y-5 bg-background">
          {showTabs && (
            <Tabs
              options={[
                { id: 'applicants', label: t('shift.applicants'), icon: Users },
                { id: 'details', label: t('shift.details', 'Детали'), icon: FileText },
              ]}
              activeId={activeTab}
              onChange={id => setActiveTab(id as 'applicants' | 'details')}
              className="mb-4"
            />
          )}

          {(!showTabs || activeTab === 'details') && (
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
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(ICON_WRAPPER_SECTION, 'mt-0.5')}
                        aria-hidden
                      >
                        <ChefHat className="h-5 w-5 text-primary shrink-0" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1.5">
                          {t('profile.specializationSection')}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {specializations.map((spec) => (
                            <span
                              key={spec}
                              className="px-4 py-2 rounded-full text-white text-sm gradient-primary"
                            >
                              {getSpecializationLabel(spec)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <DetailRow
                    icon={CalendarDays}
                    iconVariant="section"
                    label={t('common.date')}
                    value={shift.date}
                  />

                  <DetailRow
                    icon={Clock}
                    iconVariant="section"
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
                      iconVariant="section"
                      label={t('common.location')}
                      value={location}
                      action={
                        <Button
                          onClick={handleOpenMap}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-primary hover:underline mt-1 px-0 h-auto"
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
                        {shift.pay == null || Number(shift.pay) === 0
                          ? t('shift.payNegotiable')
                          : `${shift.pay} ${shift.currency}`}
                      </span>
                    }
                    subValue={shift.pay != null && Number(shift.pay) > 0 ? paySuffix : undefined}
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
                        <Badge variant="outline" className="text-xs font-normal">
                          {aboutVenue.city}
                        </Badge>
                      ) : null}
                      {aboutVenue.formatKey ? (
                        <Badge variant="outline" className="text-xs font-normal">
                          {getRestaurantFormatLabel(aboutVenue.formatKey)}
                        </Badge>
                      ) : null}
                      {aboutVenue.cuisineTypes.length
                        ? aboutVenue.cuisineTypes.map(type => (
                          <Badge key={type} variant="outline" className="text-xs font-normal">
                            {type}
                          </Badge>
                        ))
                        : null}
                    </div>
                  ) : null}
                </Card>
              ) : null}

              {!isOwner && !isApplied && !isAccepted && !isRejected ? (
                <Card className={DETAIL_CARD_CLASS}>
                  <label
                    className="text-xs text-muted-foreground mb-2 block font-medium"
                    htmlFor="shift-cover-message"
                  >
                    {t('shift.coverMessage')}
                  </label>
                  <textarea
                    id="shift-cover-message"
                    value={coverMessage}
                    onChange={e => setCoverMessage(e.target.value)}
                    placeholder={t('shift.coverMessagePlaceholder')}
                    className="w-full min-h-[88px] px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 dark:focus:ring-0 resize-y"
                    maxLength={2000}
                  />
                </Card>
              ) : null}
            </>
          )}

          {showTabs && activeTab === 'applicants' && (
            <Card className={DETAIL_CARD_CLASS}>
              {applicants.length ? (
                <div className="space-y-3">
                  {applicants.map((app, index) => {
                    const user = app.user

                    const name =
                      app.full_name?.trim() ||
                      user?.full_name?.trim() ||
                      [user?.name, user?.last_name].filter(Boolean).join(' ').trim() ||
                      t('common.user')

                    const rawPosition = (
                      app.position ??
                      user?.employee_profile?.position ??
                      user?.position ??
                      ''
                    ).trim()
                    const position = rawPosition
                      ? getEmployeePositionLabel(rawPosition)
                      : t('common.notSpecified')

                    const rawRating = app.average_rating
                    const ratingValue =
                      rawRating !== undefined && rawRating !== null
                        ? Number(rawRating)
                        : NaN
                    const hasRating = Number.isFinite(ratingValue) && ratingValue > 0
                    const normalizedRating = Math.min(5, Math.max(0, ratingValue))

                    const appId = app.shift_application_id ?? app.id
                    const appStatus =
                      app.shift_application_status ?? app.status ?? 'pending'
                    const canReject =
                      Boolean(appId) &&
                      typeof appId === 'number' &&
                      (appStatus === 'pending' || appStatus === 'accepted')
                    const canAccept =
                      Boolean(appId) &&
                      typeof appId === 'number' &&
                      appStatus === 'pending'
                    const isAccepted = appStatus === 'accepted'

                    const key = appId || index
                    const userId = app.user_id || app.user?.id

                    return (
                      <div
                        key={key}
                        onClick={() => {
                          if (!userId) return
                          setSelectedApplicantId(userId)
                          setSelectedApplicantApplicationId(appId ?? null)
                        }}
                        className={cn(
                          'rounded-lg p-3 -mx-1 transition-colors cursor-pointer',
                          'hover:bg-muted/40 active:bg-muted/60',
                          isAccepted && 'ring-2 ring-primary/30 bg-primary/5'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div
                                className="text-sm font-medium text-foreground break-words"
                                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                              >
                                {name}
                              </div>
                              {isAccepted ? (
                                <Badge
                                  variant="default"
                                  className="shrink-0 text-xs font-medium bg-primary text-primary-foreground"
                                >
                                  {t('shift.applicantSelected')}
                                </Badge>
                              ) : null}
                            </div>
                            <div
                              className="text-xs text-muted-foreground break-words mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1"
                              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                            >
                              <span>
                                {t('common.position')}: {position}
                              </span>
                              {hasRating ? (
                                <span className="inline-flex items-center gap-0.5" aria-label={t('common.rating')}>
                                  {[0, 1, 2, 3, 4].map(i => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        'h-3.5 w-3.5 shrink-0',
                                        normalizedRating >= i + 0.5
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'fill-muted text-muted-foreground/40'
                                      )}
                                    />
                                  ))}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/70">—</span>
                              )}
                            </div>
                          </div>

                          {canReject || canAccept ? (
                            <div className="flex flex-row items-center gap-2 shrink-0">
                              {canReject ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 w-9 min-w-9 p-0 shrink-0"
                                  aria-label={t('shift.rejectApplication')}
                                  loading={moderating?.id === appId && moderating.action === 'reject'}
                                  disabled={moderating?.id === appId}
                                  onClick={async e => {
                                    e.stopPropagation()
                                    await handleRejectApplication(appId)
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              ) : null}
                              {canAccept ? (
                                <Button
                                  variant="gradient"
                                  size="sm"
                                  className="h-9 w-9 min-w-9 p-0 shrink-0"
                                  aria-label={t('shift.acceptApplication')}
                                  loading={moderating?.id === appId && moderating.action === 'accept'}
                                  disabled={moderating?.id === appId}
                                  onClick={async e => {
                                    e.stopPropagation()
                                    await handleAcceptApplication(appId)
                                  }}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                        {index < applicants.length - 1 ? (
                          <hr className="my-2 border-border" />
                        ) : null}
                      </div>
                    )
                  })}

                  {typeof applicationsCount === 'number' && applicationsCount > applicants.length ? (
                    <div className="text-xs text-muted-foreground mt-2">
                      {t('shift.applicantsPreviewNote', {
                        shown: applicants.length,
                        total: applicationsCount,
                      })}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">{t('shift.noApplicants')}</div>
              )}
            </Card>
          )}
        </div>
        {!isOwner && !isAccepted && !isRejected ? (
          <DrawerFooter className="border-t border-border/50 bg-background shrink-0 px-5 py-4">
            <div className="flex gap-3">
              {isApplied ? (
                <Button
                  onClick={handleCancel}
                  disabled={isLoading}
                  variant="outline"
                  size="md"
                  className="flex-1"
                >
                  {isLoading ? t('shift.cancelling') : t('shift.cancelApplication')}
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  size="md"
                  onClick={handleApply}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? t('shift.sending') : t('shift.apply')}
                </Button>
              )}
            </div>
          </DrawerFooter>
        ) : null}
      </div>
      <UserProfileDrawer
        userId={selectedApplicantId}
        open={selectedApplicantId !== null}
        applicationId={selectedApplicantApplicationId}
        canModerate={canModerateSelected}
        applicationStatus={
          selectedAppStatus === 'accepted' ? 'accepted' : 'pending'
        }
        moderatingAction={
          moderating?.id === selectedApplicantApplicationId ? moderating.action : null
        }
        onAccept={async () => {
          if (typeof selectedApplicantApplicationId !== 'number') return
          await handleAcceptApplication(selectedApplicantApplicationId)
        }}
        onReject={async () => {
          if (typeof selectedApplicantApplicationId !== 'number') return
          await handleRejectApplication(selectedApplicantApplicationId)
        }}
        onClose={() => {
          setSelectedApplicantId(null)
          setSelectedApplicantApplicationId(null)
        }}
      />
    </Drawer>
  )
})

ShiftDetailsScreen.displayName = 'ShiftDetailsScreen'
