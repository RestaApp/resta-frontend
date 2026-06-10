import type { LucideIcon } from 'lucide-react'
import { Briefcase, Clock, Inbox, Search, SlidersHorizontal, UserPlus, Users } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { EmptyIllustrationId } from '@/components/ui/empty-state-illustrations'

const CONTAINER_CLASS =
  'flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary [&_svg]:text-primary'
const ICON_CLASS = 'h-10 w-10 shrink-0 stroke-[1.5]'
const BADGE_ICON_CLASS = 'h-4 w-4 shrink-0 stroke-[1.5]'

interface SingleIconIllustrationProps {
  icon: LucideIcon
  className?: string
}

const SingleIconIllustration = ({ icon: Icon, className }: SingleIconIllustrationProps) => (
  <div className={cn(CONTAINER_CLASS, className)} aria-hidden>
    <Icon className={ICON_CLASS} />
  </div>
)

interface CombinedIconIllustrationProps {
  primary: LucideIcon
  secondary: LucideIcon
  className?: string
}

const CombinedIconIllustration = ({
  primary: Primary,
  secondary: Secondary,
  className,
}: CombinedIconIllustrationProps) => (
  <div className={cn(CONTAINER_CLASS, 'relative', className)} aria-hidden>
    <Primary className={ICON_CLASS} />
    <div className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-elevated text-primary [&_svg]:text-primary">
      <Secondary className={BADGE_ICON_CLASS} />
    </div>
  </div>
)

interface EmptyStateIllustrationProps {
  id: EmptyIllustrationId
  className?: string
}

export const EmptyStateIllustration = ({ id, className }: EmptyStateIllustrationProps) => {
  switch (id) {
    case 'filters':
      return <SingleIconIllustration icon={SlidersHorizontal} className={className} />
    case 'search':
      return <SingleIconIllustration icon={Search} className={className} />
    case 'applications':
      return <SingleIconIllustration icon={Briefcase} className={className} />
    case 'shift-applicants':
      return <CombinedIconIllustration primary={Users} secondary={UserPlus} className={className} />
    case 'inbox':
      return <SingleIconIllustration icon={Inbox} className={className} />
    case 'shifts':
      return <SingleIconIllustration icon={Clock} className={className} />
  }
}
