import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'text' | 'circular' | 'rectangular'
}

const VARIANT_CLASSES: Record<NonNullable<SkeletonProps['variant']>, string> = {
  default: 'rounded-lg',
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-none',
}

export const Skeleton = memo(function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'animate-pulse bg-primary/10 border border-primary/20',
        VARIANT_CLASSES[variant],
        className
      )}
      aria-label={t('common.loading')}
      role="status"
    />
  )
})
