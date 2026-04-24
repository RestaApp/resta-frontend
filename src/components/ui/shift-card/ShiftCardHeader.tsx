import type { Shift } from '@/features/feed/model/types'
import { Avatar, AvatarFallback, AvatarImage } from '..'
import { UrgentPill, VerifiedBadge } from '../StatusPill'
import { cn } from '@/utils/cn'

interface ShiftCardHeaderProps {
  shift: Shift
  displayTitle: string | null
  positionText: string
  priceContent: React.ReactNode
  hidePrice?: boolean
}

export const ShiftCardHeader = ({
  shift,
  displayTitle,
  positionText,
  priceContent,
  hidePrice = false,
}: ShiftCardHeaderProps) => {
  return (
    <div className="flex justify-between items-start gap-3 mb-2">
      <div className="flex gap-3 min-w-0 flex-1">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center text-xl border border-border/50 overflow-hidden">
          <Avatar className="w-11 h-11 rounded-xl">
            <AvatarImage src={shift.userPhotoUrl} alt="" />
            <AvatarFallback className="rounded-xl bg-muted/60 text-xl leading-none">
              <span className="leading-none">{shift.logo}</span>
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="font-semibold text-[15px] leading-snug tracking-tight">{displayTitle ?? positionText}</h3>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {shift.urgent ? <UrgentPill /> : null}
            {shift.verified ? <VerifiedBadge /> : null}
            {displayTitle != null && shift.rating > 0 ? (
              <span className="text-[11px] font-medium text-muted-foreground font-mono-resta">
                ★ {shift.rating}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {!hidePrice ? (
        <div className="text-right flex-shrink-0 pt-0.5">
          <span
            className={cn(
              'font-display text-2xl leading-none tracking-tight text-foreground',
              shift.urgent && 'text-primary'
            )}
          >
            {priceContent}
          </span>
        </div>
      ) : null}
    </div>
  )
}
