import { memo, useCallback } from 'react'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
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
  /** Бейдж над карточкой (например, «Чаще всего выбирают») */
  badge?: string
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
  badge,
  onSelect,
}: CardSelectProps<TId>) => {
  const handleClick = useCallback(() => onSelect(id), [id, onSelect])

  return (
    <div className="relative">
      {badge ? (
        <span className="absolute -top-3 left-3 z-10">
          <span className="relative block">
            <span
              className="absolute top-1 left-0 right-0 bottom-0 rounded-tl-xl bg-background pointer-events-none -z-10"
              aria-hidden
            />
            <span className="relative rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
              {badge}
            </span>
          </span>
        </span>
      ) : null}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        aria-label={ariaLabel ?? title}
        aria-pressed={isSelected}
        className={cn(
          'w-full rounded-xl border p-4 text-left transition-all',
          isSelected
            ? 'gradient-primary border-transparent text-white shadow-lg ring-2 ring-primary/30'
            : 'border-border',
          layout === 'vertical' ? 'bg-card shadow-md shadow-black/5' : '',
          layout === 'horizontal' ? 'flex items-center gap-4' : 'flex flex-col items-center gap-3',
          badge ? 'pt-5' : '',
          className
        )}
      >
        {image ? (
          <div
            className={cn(
              'shrink-0 flex items-center justify-center rounded-xl',
              layout === 'horizontal' ? 'h-12 w-12' : 'h-14 w-14',
              imageType === 'emoji'
                ? 'bg-transparent'
                : isSelected
                  ? 'bg-white/20'
                  : 'gradient-primary'
            )}
            aria-hidden="true"
          >
            {typeof image === 'string' && imageType === 'emoji' ? (
              <span className="text-3xl leading-none">{image}</span>
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
            <div
              className={cn('mt-1 text-sm', isSelected ? 'text-white/80' : 'text-muted-foreground')}
            >
              {description}
            </div>
          ) : null}
        </div>

        {isSelected ? (
          <div className="shrink-0 rounded-full bg-white/25 p-1" aria-hidden="true">
            <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        ) : null}
      </motion.button>
    </div>
  )
}

export const CardSelect = memo(CardSelectInner) as typeof CardSelectInner
