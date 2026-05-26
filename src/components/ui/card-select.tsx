import { memo, useCallback } from 'react'
import { motion } from 'motion/react'
import {
  SHIFT_CARD_LOGO_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
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
  /** Строка социального доказательства под описанием */
  socialProof?: string
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
  socialProof,
  onSelect,
}: CardSelectProps<TId>) => {
  const handleClick = useCallback(() => onSelect(id), [id, onSelect])

  return (
    <div className="relative">
      {badge ? (
        <span className="absolute -top-3 left-3 z-10">
          <span className="relative block">
            <span
              className="pointer-events-none absolute bottom-0 left-0 right-0 top-1 -z-10 rounded-tl-lg bg-background"
              aria-hidden
            />
            <span className="relative rounded-sm bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
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
          'w-full rounded-lg border p-3 text-left transition-all',
          isSelected
            ? 'bg-primary border-transparent text-white  ring-2 ring-primary/25'
            : 'border-border',
          layout === 'vertical' ? 'bg-card shadow-md shadow-black/5' : '',
          layout === 'horizontal' ? 'flex items-center gap-2' : 'flex flex-col items-center gap-2',
          badge ? 'pt-5' : '',
          className
        )}
      >
        {image ? (
          <div
            className={cn(
              SHIFT_CARD_LOGO_CLASS,
              '[&_svg]:stroke-[1.5]',
              imageType === 'emoji'
                ? 'bg-transparent'
                : isSelected
                  ? 'bg-white/20 [&_svg]:text-white'
                  : 'border border-border/60 bg-secondary [&_svg]:text-muted-foreground',
              layout === 'horizontal' ? 'h-9 w-9' : 'h-10 w-10'
            )}
            aria-hidden="true"
          >
            {typeof image === 'string' && imageType === 'emoji' ? (
              <span className="text-lg leading-none">{image}</span>
            ) : (
              image
            )}
          </div>
        ) : null}

        <div
          className={cn(
            'flex flex-col gap-1',
            layout === 'horizontal' ? 'min-w-0 flex-1' : 'text-center'
          )}
        >
          <div
            className={cn(SHIFT_CARD_TITLE_CLASS, isSelected ? 'text-white' : 'text-foreground')}
          >
            {title}
          </div>
          {description ? (
            <div className={cn(SHIFT_CARD_SUB_CLASS, isSelected ? 'text-white/80' : '')}>
              {description}
            </div>
          ) : null}
          {socialProof ? (
            <div
              className={cn(
                'font-mono-resta text-xs font-medium',
                isSelected ? 'text-white/60' : 'text-muted-foreground/70'
              )}
            >
              {socialProof}
            </div>
          ) : null}
        </div>
      </motion.button>
    </div>
  )
}

export const CardSelect = memo(CardSelectInner) as typeof CardSelectInner
