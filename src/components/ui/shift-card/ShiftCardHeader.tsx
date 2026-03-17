import type { Shift } from '@/features/feed/model/types'
import { Avatar, AvatarFallback, AvatarImage } from '..'
import { UrgentPill } from '../StatusPill'
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
    <div className="flex justify-between items-start gap-3 mb-1.5">
      <div className="flex gap-3 min-w-0 flex-1">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted/60 flex items-center justify-center text-2xl border border-border/50 overflow-hidden">
          {shift.userPhotoUrl ? (
            <Avatar className="w-12 h-12 rounded-lg">
              <AvatarImage src={shift.userPhotoUrl} alt="" />
              <AvatarFallback className="rounded-lg bg-muted/60 text-2xl">
                {shift.logo}
              </AvatarFallback>
            </Avatar>
          ) : (
            shift.logo
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-base leading-tight">{displayTitle ?? positionText}</h3>
          {shift.urgent ? (
            <div>
              <UrgentPill />
            </div>
          ) : null}
          {displayTitle != null && shift.rating > 0 ? (
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mt-0.5">
              ★ {shift.rating}
            </div>
          ) : null}
        </div>
      </div>
      {!hidePrice ? (
        <div className="text-right flex-shrink-0">
          <span
            className={cn(
              'font-semibold text-lg text-primary tracking-tight',
              shift.urgent && 'dark:font-bold dark:text-[1.0625rem]'
            )}
          >
            {priceContent}
          </span>
        </div>
      ) : null}
    </div>
  )
}
