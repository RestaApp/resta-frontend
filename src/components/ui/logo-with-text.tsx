import { memo } from 'react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import {
  logoAnimation,
  textAnimation,
  logoTransition,
  createTextTransition,
  ANIMATION_DELAY_STEP,
} from '@/shared/constants/animations'

interface LogoWithTextProps {
  icon: ReactNode
  title: string
  subtitle?: string
  titleDelay?: number
  subtitleDelay?: number
  className?: string
  iconClassName?: string
  titleClassName?: string
  subtitleClassName?: string
}

export const LogoWithText = memo(function LogoWithText({
  icon,
  title,
  subtitle,
  titleDelay = 3,
  subtitleDelay = 5,
  className,
  iconClassName,
  titleClassName,
  subtitleClassName,
}: LogoWithTextProps) {
  return (
    <motion.div
      initial={logoAnimation.initial}
      animate={logoAnimation.animate}
      transition={logoTransition}
      className={cn('flex flex-col items-center gap-3', className)}
    >
      <div className={iconClassName}>{icon}</div>

      <motion.h1
        initial={textAnimation.initial}
        animate={textAnimation.animate}
        transition={createTextTransition(ANIMATION_DELAY_STEP * titleDelay)}
        className={cn('text-center text-foreground', titleClassName)}
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={textAnimation.initial}
          animate={textAnimation.animate}
          transition={createTextTransition(ANIMATION_DELAY_STEP * subtitleDelay)}
          className={cn('text-center text-muted-foreground', subtitleClassName)}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
})
