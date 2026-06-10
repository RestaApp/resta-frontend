import { memo, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/shared/utils/cn'

const PANEL_TRANSITION = { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const }

export interface StepPanelProps {
  stepKey: string | number
  children: ReactNode
  className?: string
  /** Смещение при переходе вперёд (px). */
  offsetPx?: number
}

/**
 * Обёртка контента шага: плавный crossfade + лёгкий slide при смене stepKey.
 */
export const StepPanel = memo(function StepPanel({
  stepKey,
  children,
  className,
  offsetPx = 16,
}: StepPanelProps) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stepKey}
        className={cn('ui-density-stack', className)}
        initial={reduceMotion ? false : { opacity: 0, x: offsetPx }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, x: -offsetPx }}
        transition={reduceMotion ? { duration: 0 } : PANEL_TRANSITION}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
})
