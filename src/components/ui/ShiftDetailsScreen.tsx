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
import { Drawer, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'
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

const DETAIL_CARD_CLASS = 'p-4 rounded-xl border border-border bg-background'

const TextCard = memo(({ icon: Icon, title, content }: TextCardProps) => (
  <Card className={DETAIL_CARD_CLASS}>
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
  const { getRestaurantFormatLabel, getEmployeePositionLabel } = useLabels()
  const {
    aboutVenue,
    hourlyRate,
    shiftTypeLabel,
    vacancyTitle,
    positionLabel,
    specializationLabel,
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

  const extractModerationMessage = useCallback((result: unknown): string | undefined => {
    const r = result as { message?: string; data?: { message?: string } } | null
    return r?.message ?? r?.data?.message
  }, [])

  const handleAcceptApplication = useCallback(
    async (id: number) => {
      try {
        setModerating({ id, action: 'accept' })
        triggerHapticFeedback('light')
        const result = await acceptApplication(id).unwrap()
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
    [acceptApplication, extractModerationMessage, showToast, t]
  )

  const handleRejectApplication = useCallback(
    async (id: number) => {
      try {
        setModerating({ id, action: 'reject' })
        triggerHapticFeedback('light')
        const result = await rejectApplication(id).unwrap()
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
    [extractModerationMessage, rejectApplication, showToast, t]
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
        <DrawerHeader className="pb-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <DrawerTitle className="text-xl break-words capitalize">
                {vacancyTitle}
              </DrawerTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {[shiftTypeLabel, shift.date, shift.time].filter(Boolean).join(' · ')}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              aria-label={t('common.close')}
              className="min-w-[44px] min-h-[44px] p-2 hover:bg-muted flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {shift.urgent ? <UrgentPill /> : null}
            <StatusPill status={appStatus} />
          </div>
        </DrawerHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-2 space-y-4 bg-background">
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
                <Card className={DETAIL_CARD_CLASS}>
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
                <Card className={DETAIL_CARD_CLASS}>
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

                    const years = app.experience_years ?? user?.employee_profile?.experience_years
                    const experienceYearsValue =
                      typeof years === 'number' && Number.isFinite(years)
                        ? String(years)
                        : t('common.notSpecified')

                    const appId = app.shift_application_id ?? app.id
                    const canModerate = Boolean(appId) && (!app.status || app.status === 'pending')

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
                          'rounded-lg p-2 -mx-2 transition-colors cursor-pointer',
                          'hover:bg-muted/50 active:bg-muted'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div
                              className="text-[14px] font-medium break-words"
                              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                            >
                              {name}
                            </div>
                            <div
                              className="text-[12px] text-muted-foreground break-words"
                              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                            >
                              {t('common.position')}: {position} • {t('profile.experienceYearsLabel')}
                              : {experienceYearsValue}
                            </div>
                          </div>

                          {canModerate && typeof appId === 'number' ? (
                            <div className="flex flex-col gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                loading={moderating?.id === appId && moderating.action === 'reject'}
                                disabled={moderating?.id === appId}
                                onClick={async e => {
                                  e.stopPropagation()
                                  await handleRejectApplication(appId)
                                }}
                              >
                                {moderating?.id === appId && moderating.action === 'reject'
                                  ? t('shift.rejectingApplication')
                                  : t('shift.rejectApplication')}
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                loading={moderating?.id === appId && moderating.action === 'accept'}
                                disabled={moderating?.id === appId}
                                onClick={async e => {
                                  e.stopPropagation()
                                  await handleAcceptApplication(appId)
                                }}
                              >
                                {moderating?.id === appId && moderating.action === 'accept'
                                  ? t('shift.acceptingApplication')
                                  : t('shift.acceptApplication')}
                              </Button>
                            </div>
                          ) : null}
                        </div>
                        {index < applicants.length - 1 ? (
                          <hr className="my-3 border-border" />
                        ) : null}
                      </div>
                    )
                  })}

                  {typeof applicationsCount === 'number' && applicationsCount > applicants.length ? (
                    <div className="text-[12px] text-muted-foreground">
                      {t('shift.applicantsPreviewNote', {
                        shown: applicants.length,
                        total: applicationsCount,
                      })}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-[14px] text-muted-foreground">{t('shift.noApplicants')}</div>
              )}
            </Card>
          )}
        </div>
        <DrawerFooter className="border-t border-border shrink-0">
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
                  variant="gradient"
                  onClick={handleApply}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? t('shift.sending') : t('shift.apply')}
                </Button>
              )}
            </div>
          )}
        </DrawerFooter>
      </div>
      <UserProfileDrawer
        userId={selectedApplicantId}
        open={selectedApplicantId !== null}
        applicationId={selectedApplicantApplicationId}
        canModerate={isOwner && typeof selectedApplicantApplicationId === 'number'}
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
