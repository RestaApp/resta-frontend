import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { AVATAR_LG_CLASS } from '@/components/ui/avatar-styles'
import { SHIFT_CARD_CLASS } from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'

interface ProfileSkeletonProps {
  variant?: 'page' | 'drawer'
  className?: string
}

const ProfileHeroSkeleton = memo(function ProfileHeroSkeleton() {
  return (
    <div className="flex items-center gap-4 py-1">
      <Skeleton className={cn(AVATAR_LG_CLASS, 'shrink-0')} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-7 w-3/5 rounded-md" />
        <Skeleton className="h-4 w-2/5 rounded-md" />
      </div>
    </div>
  )
})
ProfileHeroSkeleton.displayName = 'ProfileHeroSkeleton'

const ProfileKpiSkeleton = memo(function ProfileKpiSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-16 rounded-lg" />
      ))}
    </div>
  )
})
ProfileKpiSkeleton.displayName = 'ProfileKpiSkeleton'

const ProfileInfoCardSkeleton = memo(function ProfileInfoCardSkeleton() {
  return (
    <div className={cn(SHIFT_CARD_CLASS, 'flex flex-col gap-3')}>
      <Skeleton className="h-5 w-2/5 rounded-md" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
        <Skeleton className="h-4 w-3/5 rounded-md" />
      </div>
    </div>
  )
})
ProfileInfoCardSkeleton.displayName = 'ProfileInfoCardSkeleton'

const ProfileSettingsSkeleton = memo(function ProfileSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-28 rounded-md" />
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
  )
})
ProfileSettingsSkeleton.displayName = 'ProfileSettingsSkeleton'

export const ProfileSkeleton = memo(function ProfileSkeleton({
  variant = 'page',
  className,
}: ProfileSkeletonProps) {
  return (
    <div className={cn('ui-density-stack', className)}>
      <ProfileHeroSkeleton />
      <ProfileKpiSkeleton />
      <ProfileInfoCardSkeleton />
      <ProfileInfoCardSkeleton />
      {variant === 'page' ? <ProfileSettingsSkeleton /> : null}
    </div>
  )
})
ProfileSkeleton.displayName = 'ProfileSkeleton'
