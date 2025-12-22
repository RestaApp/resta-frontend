/**
 * Универсальный компонент карточки для выбора
 * Поддерживает различные варианты отображения: роли (горизонтально) и позиции (вертикально)
 */

import { memo, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '../../utils/cn'
import { roleCardAnimation, ANIMATION_DELAY_STEP } from '../../constants/animations'

export type CardLayout = 'horizontal' | 'vertical'
export type ImageType = 'icon' | 'emoji'

interface CardSelectProps {
  id: string
  title: string
  description?: string
  image: ReactNode
  imageType: ImageType
  isSelected: boolean
  index: number
  layout?: CardLayout
  onSelect: (id: string) => void
  className?: string
  ariaLabel?: string
}

export const CardSelect = memo(function CardSelect({
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
}: CardSelectProps) {
  const isHorizontal = layout === 'horizontal'
  const isIcon = imageType === 'icon'

  const cardStyle = isSelected
    ? {
        background: 'var(--gradient-glow)',
        borderColor: 'var(--pink-electric)',
      }
    : undefined

  const iconStyle = isIcon
    ? {
        background: 'var(--gradient-primary)',
      }
    : undefined

  return (
    <motion.button
      initial={roleCardAnimation.initial}
      animate={roleCardAnimation.animate}
      transition={{
        delay: ANIMATION_DELAY_STEP * index,
        duration: 0.4,
      }}
      /* hover removed for mobile-first app */
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(id)}
      className={cn(
        'group relative overflow-hidden bg-white rounded-2xl shadow-md transition-all duration-300 w-full p-6 border-2',
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
                ? 'p-3 rounded-xl flex items-center justify-center flex-shrink-0'
                : 'flex items-center justify-center'
            )}
            style={iconStyle}
          >
            {typeof image === 'string' ? <span className="text-4xl">{image}</span> : image}
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-lg mb-1 font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground leading-tight">{description}</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div
            className={cn(
              isIcon
                ? 'p-3 rounded-xl flex items-center justify-center flex-shrink-0'
                : 'flex items-center justify-center'
            )}
            style={iconStyle}
          >
            {typeof image === 'string' ? <span className="text-4xl">{image}</span> : image}
          </div>
          <div className="text-center text-foreground font-medium">{title}</div>
        </>
      )}
    </motion.button>
  )
})
