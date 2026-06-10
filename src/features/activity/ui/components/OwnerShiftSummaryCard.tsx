import { useCallback, useMemo, type KeyboardEvent } from 'react'
import { Clock, Eye, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AVATAR_FALLBACK_CLASS, AVATAR_SM_CLASS } from '@/components/ui/avatar-styles'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_CURRENCY_CLASS,
  SHIFT_CARD_INTERACTIVE_CLASS,
  SHIFT_CARD_META_CLASS,
  SHIFT_CARD_PRICE_CLASS,
  SHIFT_CARD_ROW_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { positionInitial } from '@/components/ui/shift-card/shift-card-utils'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'
import { formatMoney } from '@/shared/shifts/formatting'
import {
  formatOwnerShiftScheduleLine,
  getOwnerShiftSubtitle,
  getOwnerShiftTitle,
} from '@/shared/shifts/ownerShiftDisplay'
import { useLabels } from '@/shared/i18n/hooks'
import { formatViewsCount } from '@/shared/utils/viewsCount'
import { cn } from '@/shared/utils/cn'

interface OwnerShiftSummaryCardProps {
  vacancy: VacancyApiItem
  photoUrl?: string | null
  onOpenDetails?: () => void
}

export const OwnerShiftSummaryCard = ({
  vacancy,
  photoUrl,
  onOpenDetails,
}: OwnerShiftSummaryCardProps) => {
  const { t } = useTranslation()
  const { getEmployeePositionLabel, getSpecializationLabel } = useLabels()

  const positionLabel = getEmployeePositionLabel(vacancy.position ?? '')
  const specialization = vacancy.specialization ?? vacancy.specializations?.[0] ?? null
  const specializationLabel = specialization ? getSpecializationLabel(specialization) : null

  const title = useMemo(
    () => getOwnerShiftTitle(vacancy, positionLabel, specializationLabel),
    [positionLabel, specializationLabel, vacancy]
  )
  const subtitle = useMemo(() => getOwnerShiftSubtitle(vacancy), [vacancy])
  const scheduleLine = useMemo(
    () => formatOwnerShiftScheduleLine(vacancy.start_time, vacancy.end_time),
    [vacancy.end_time, vacancy.start_time]
  )

  const pay = vacancy.payment ?? vacancy.hourly_rate
  const payNumber = pay == null ? null : Number(pay)
  const hasPay = payNumber != null && Number.isFinite(payNumber) && payNumber > 0

  const applicantsCount = vacancy.applications_count ?? 0
  const hasApplicantsCount = typeof applicantsCount === 'number' && applicantsCount >= 0
  const viewsCount = vacancy.views_count
  const hasViewsCount = typeof viewsCount === 'number' && Number.isFinite(viewsCount)

  const resolvedPhotoUrl =
    photoUrl ?? vacancy.user?.photo_url ?? vacancy.user?.profile_photo_url ?? null
  const avatarFallback = positionInitial(vacancy.position ?? 'chef')

  const cardAriaLabel = [title, subtitle, scheduleLine].filter(Boolean).join(', ')

  const handleOpen = useCallback(() => {
    onOpenDetails?.()
  }, [onOpenDetails])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!onOpenDetails) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      handleOpen()
    },
    [handleOpen, onOpenDetails]
  )

  return (
    <div
      role={onOpenDetails ? 'button' : undefined}
      tabIndex={onOpenDetails ? 0 : undefined}
      aria-label={onOpenDetails ? cardAriaLabel : undefined}
      onClick={onOpenDetails ? handleOpen : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        SHIFT_CARD_CLASS,
        onOpenDetails && SHIFT_CARD_INTERACTIVE_CLASS,
        'flex flex-col gap-2'
      )}
    >
      <div className={SHIFT_CARD_ROW_CLASS}>
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <Avatar className={AVATAR_SM_CLASS}>
            <AvatarImage src={resolvedPhotoUrl ?? undefined} alt={title} />
            <AvatarFallback className={AVATAR_FALLBACK_CLASS}>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className={cn(SHIFT_CARD_TITLE_CLASS, 'line-clamp-2')}>{title}</h3>
            {subtitle ? <p className={SHIFT_CARD_SUB_CLASS}>{subtitle}</p> : null}
          </div>
        </div>

        <div className="shrink-0 text-right leading-none tabular-nums text-foreground">
          {hasPay ? (
            <>
              <span className={SHIFT_CARD_PRICE_CLASS}>{formatMoney(payNumber ?? 0)}</span>
              <span className={SHIFT_CARD_CURRENCY_CLASS}>BYN</span>
            </>
          ) : (
            <span className={cn(SHIFT_CARD_SUB_CLASS, 'font-semibold')}>
              {t('shift.payNegotiable')}
            </span>
          )}
        </div>
      </div>

      {scheduleLine ? (
        <div className={SHIFT_CARD_META_CLASS}>
          <span className="inline-flex min-w-0 items-center gap-1">
            <Clock className={ICON_SM_CLASS} aria-hidden />
            {scheduleLine}
          </span>
        </div>
      ) : null}

      {hasApplicantsCount || hasViewsCount ? (
        <div className={cn(SHIFT_CARD_META_CLASS, 'justify-end')}>
          {hasApplicantsCount ? (
            <span className="inline-flex items-center gap-1">
              <User className={ICON_SM_CLASS} aria-hidden />
              {t('shift.applicantsLabel', { count: applicantsCount })}
            </span>
          ) : null}
          {hasViewsCount ? (
            <span className="inline-flex items-center gap-1">
              <Eye className={ICON_SM_CLASS} aria-hidden />
              {formatViewsCount(viewsCount ?? 0)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
