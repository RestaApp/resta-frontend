import type { Shift } from '@/features/feed/model/types'
import type { RoleTheme } from '@/shared/lib/role-theme'
import { Avatar, AvatarFallback, AvatarImage } from '..'
import { UrgentPill, VerifiedBadge } from '../StatusPill'
import { cn } from '@/utils/cn'

interface ShiftCardHeaderProps {
  shift: Shift
  displayTitle: string | null
  positionText: string
  priceContent: React.ReactNode
  hidePrice?: boolean
  isEmployeeCard?: boolean
  /** Акценты SOS / сумма по палитре роли (ленты E03–E04). */
  accentRole?: RoleTheme | null
}

export const ShiftCardHeader = ({
  shift,
  displayTitle,
  positionText,
  priceContent,
  hidePrice = false,
  isEmployeeCard = false,
  accentRole = null,
}: ShiftCardHeaderProps) => {
  const showAvatar = !shift.urgent || !isEmployeeCard

  return (
    <div className="mb-2 flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 gap-3">
        {showAvatar ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted/60 text-xl">
            <Avatar className="h-11 w-11 rounded-xl">
              <AvatarImage src={shift.userPhotoUrl} alt="" />
              <AvatarFallback className="rounded-xl bg-muted/60 text-xl leading-none">
                <span className="leading-none">{shift.logo}</span>
              </AvatarFallback>
            </Avatar>
          </div>
        ) : null}
        <div className="min-w-0 flex-1 pt-0.5">
          {shift.urgent ? (
            <UrgentPill
              className={cn(
                'mb-2',
                accentRole
                  ? cn(accentRole.classes.bg, accentRole.classes.textOn, 'border-0')
                  : 'bg-primary text-white'
              )}
            />
          ) : null}
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">
            {displayTitle ?? positionText}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {!isEmployeeCard && shift.verified ? <VerifiedBadge /> : null}
            {displayTitle != null && shift.rating > 0 ? (
              <span className="font-mono-resta text-meta font-medium text-muted-foreground">
                ★ {shift.rating}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {!hidePrice ? (
        <div className="shrink-0 pt-0.5 text-right">
          <span
            className={cn(
              'font-display text-[1.65rem] leading-none tracking-[-0.02em] tabular-nums text-foreground',
              shift.urgent && (accentRole ? accentRole.classes.text : 'text-primary')
            )}
          >
            {priceContent}
          </span>
        </div>
      ) : null}
    </div>
  )
}
