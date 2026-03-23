import { memo } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ICON_WRAPPER_SECTION } from './constants'

interface DetailRowProps {
  icon: LucideIcon
  iconColor?: string
  iconVariant?: 'meta' | 'section'
  label: string
  value: string | ReactNode
  subValue?: string | ReactNode
  action?: ReactNode
}

export const DetailRow = memo(
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
          <Icon className="h-5 w-5 shrink-0 stroke-[1.5] text-primary" />
        </div>
      ) : (
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0 stroke-[1.5]', iconColor)} />
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
