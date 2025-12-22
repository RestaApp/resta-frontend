/**
 * Переиспользуемый компонент логотипа с текстом и анимацией
 * Используется в splash screens и loading pages
 */

import { memo } from 'react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { logoAnimation, textAnimation, logoTransition, createTextTransition, ANIMATION_DELAY_STEP } from '../../constants/animations'

interface LogoWithTextProps {
  /** Иконка или изображение логотипа */
  icon: ReactNode
  /** Заголовок */
  title: string
  /** Подзаголовок */
  subtitle?: string
  /** Задержка для заголовка (в шагах ANIMATION_DELAY_STEP) */
  titleDelay?: number
  /** Задержка для подзаголовка (в шагах ANIMATION_DELAY_STEP) */
  subtitleDelay?: number
  /** Дополнительные классы для контейнера */
  className?: string
  /** Дополнительные классы для иконки */
  iconClassName?: string
  /** Дополнительные классы для заголовка */
  titleClassName?: string
  /** Дополнительные классы для подзаголовка */
  subtitleClassName?: string
}

export const LogoWithText = memo(function LogoWithText({
  icon,
  title,
  subtitle,
  titleDelay = 3,
  subtitleDelay = 5,
  className = '',
  iconClassName = '',
  titleClassName = '',
  subtitleClassName = '',
}: LogoWithTextProps) {
  return (
    <motion.div
      initial={logoAnimation.initial}
      animate={logoAnimation.animate}
      transition={logoTransition}
      className={`flex flex-col items-center ${className}`}
    >
      <div className={iconClassName}>{icon}</div>

      <motion.h1
        initial={textAnimation.initial}
        animate={textAnimation.animate}
        transition={createTextTransition(ANIMATION_DELAY_STEP * titleDelay)}
        className={`text-center mb-3 text-foreground ${titleClassName}`}
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={textAnimation.initial}
          animate={textAnimation.animate}
          transition={createTextTransition(ANIMATION_DELAY_STEP * subtitleDelay)}
          className={`text-center text-muted-foreground ${subtitleClassName}`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
})

