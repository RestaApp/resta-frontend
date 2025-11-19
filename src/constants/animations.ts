/**
 * Константы анимаций
 */

export const ANIMATION_DELAY_STEP = 0.1
export const ANIMATION_DURATION = 0.5

export const logoAnimation = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
} as const

export const textAnimation = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
} as const

export const roleCardAnimation = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
} as const

export const checkIconAnimation = {
  initial: { scale: 0 },
  animate: { scale: 1 },
} as const

export const cardAnimation = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
} as const
