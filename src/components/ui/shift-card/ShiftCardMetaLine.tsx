import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'
import { cn } from '@/shared/utils/cn'
import { SHIFT_CARD_META_CLASS } from '@/components/ui/shift-card/shift-card-styles'

interface ShiftCardMetaLineProps {
  icon: LucideIcon
  children: ReactNode
  className?: string
}

export const ShiftCardMetaLine = ({ icon: Icon, children, className }: ShiftCardMetaLineProps) => (
  <span className={cn(SHIFT_CARD_META_CLASS, 'min-w-0 truncate', className)}>
    <Icon className={cn(ICON_SM_CLASS, 'shrink-0')} aria-hidden />
    <span className="min-w-0 truncate">{children}</span>
  </span>
)
