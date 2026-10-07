import { memo } from 'react'
import { cn } from '@/shared/utils/cn'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<LoaderProps['size']>, string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-8 border-[3px]',
}

/**
 * Единый спиннер приложения: тонкое кольцо-«трек» и одна яркая дуга — в той же
 * стилистике, что орбита на экране загрузки. Одна CSS-анимация, без вложенных колец.
 */
export const Loader = memo(function Loader({ size = 'md', className }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex items-center justify-center', className)}
    >
      <span
        className={cn(
          'block animate-spin rounded-full border-primary/20 border-t-primary',
          SIZE_CLASSES[size]
        )}
        style={{ animationDuration: '0.9s' }}
        aria-hidden="true"
      />
    </div>
  )
})
