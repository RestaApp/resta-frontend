import { memo, useCallback } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'

type ImageType = 'emoji' | 'icon'

interface CardSelectBaseProps {
  title: string
  description?: string
  image?: React.ReactNode
  imageType?: ImageType
  isSelected?: boolean
  index?: number
  layout?: 'horizontal' | 'vertical'
  className?: string
  ariaLabel?: string
}

export interface CardSelectProps<TId extends string> extends CardSelectBaseProps {
  id: TId
  onSelect: (id: TId) => void
}

const CardSelectInner = <TId extends string>({
  id,
  title,
  description,
  image,
  imageType = 'icon',
  isSelected = false,
  layout = 'horizontal',
  className,
  ariaLabel,
  onSelect,
}: CardSelectProps<TId>) => {
  const handleClick = useCallback(() => onSelect(id), [id, onSelect])

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      aria-label={ariaLabel ?? title}
      aria-pressed={isSelected}
      className={cn(
        'w-full rounded-2xl border p-4 text-left transition-all',
        isSelected ? 'border-transparent shadow-lg' : 'border-border',
        layout === 'horizontal' ? 'flex items-center gap-4' : 'flex flex-col items-center gap-3',
        className
      )}
      style={isSelected ? { background: 'var(--gradient-primary)', color: 'white' } : undefined}
    >
      {image ? (
        <div
          className={cn(
            'shrink-0 flex items-center justify-center rounded-2xl',
            layout === 'horizontal' ? 'h-12 w-12' : 'h-14 w-14',
            isSelected ? 'bg-white/20' : 'bg-muted/50'
          )}
          aria-hidden="true"
        >
          {typeof image === 'string' && imageType === 'emoji' ? (
            <span className="text-2xl leading-none">{image}</span>
          ) : (
            image
          )}
        </div>
      ) : null}

      <div className={cn(layout === 'horizontal' ? 'min-w-0 flex-1' : 'text-center')}>
        <div className={cn('font-semibold', isSelected ? 'text-white' : 'text-foreground')}>
          {title}
        </div>
        {description ? (
          <div className={cn('mt-1 text-sm', isSelected ? 'text-white/80' : 'text-muted-foreground')}>
            {description}
          </div>
        ) : null}
      </div>
    </motion.button>
  )
}

/**
 * Важно: memo не ломает generic, если экспортировать так
 */
export const CardSelect = memo(CardSelectInner) as typeof CardSelectInner