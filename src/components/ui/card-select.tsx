import { memo, useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/utils/cn'
import { roleCardAnimation, ANIMATION_DELAY_STEP } from '@/constants/animations'

export type CardLayout = 'horizontal' | 'vertical'
export type ImageType = 'icon' | 'emoji'

type BaseProps = {
  id: string
  title: string
  description?: string
  isSelected: boolean
  index: number
  layout?: CardLayout
  onSelect: (id: string) => void
  className?: string
  ariaLabel?: string
}

type CardSelectProps =
  | (BaseProps & { imageType: 'emoji'; image: string })
  | (BaseProps & { imageType: 'icon'; image: React.ReactNode })

export const CardSelect = memo(function CardSelect(props: CardSelectProps) {
  const reduceMotion = useReducedMotion()

  const {
    id,
    title,
    description,
    image,
    imageType,
    isSelected,
    index,
    layout = 'horizontal',
    onSelect,
    className,
    ariaLabel,
  } = props

  const isHorizontal = layout === 'horizontal'
  const isIcon = imageType === 'icon'

  const cardStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!isSelected) return undefined
    return {
      background: 'var(--gradient-glow)',
      borderColor: 'var(--pink-electric)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }
  }, [isSelected])

  const iconStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!isIcon) return undefined
    return { background: 'var(--gradient-primary)' }
  }, [isIcon])

  return (
    <motion.button
      type="button"
      initial={roleCardAnimation.initial}
      animate={roleCardAnimation.animate}
      transition={{ delay: ANIMATION_DELAY_STEP * index, duration: 0.4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      onClick={() => onSelect(id)}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border-2 bg-card p-6 shadow-md backdrop-blur-xl transition-all duration-300',
        isSelected ? 'shadow-xl scale-[1.02]' : 'border-transparent',
        !isHorizontal && 'flex flex-col items-center gap-3',
        className
      )}
      style={cardStyle}
      aria-pressed={isSelected}
      aria-label={ariaLabel || `Выбрать: ${title}`}
    >
      {isHorizontal ? (
        <div className="flex items-center gap-4">
          <div
            className={cn(
              isIcon
                ? 'flex shrink-0 items-center justify-center rounded-xl p-3'
                : 'flex items-center justify-center'
            )}
            style={iconStyle}
          >
            {imageType === 'emoji' ? <span className="text-4xl">{image}</span> : image}
          </div>

          <div className="flex-1 text-left">
            <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
            {description && <p className="text-sm leading-tight text-muted-foreground">{description}</p>}
          </div>
        </div>
      ) : (
        <>
          <div
            className={cn(
              isIcon
                ? 'flex shrink-0 items-center justify-center rounded-xl p-3'
                : 'flex items-center justify-center'
            )}
            style={iconStyle}
          >
            {imageType === 'emoji' ? <span className="text-4xl">{image}</span> : image}
          </div>
          <div className="text-center font-medium text-foreground">{title}</div>
        </>
      )}
    </motion.button>
  )
})