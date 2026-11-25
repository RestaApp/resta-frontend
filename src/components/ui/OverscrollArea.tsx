import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { useOverscrollBounce } from '@/shared/lib/hooks/useOverscrollBounce'

interface OverscrollAreaProps {
  children: ReactNode
  className?: string
}

/**
 * Содержимое экрана с резинкой на краях скролла (`useOverscrollBounce`) — для
 * экранов без pull-to-refresh. Списки с обновлением используют `PullToRefresh`:
 * резинка уже внутри него.
 *
 * Шапку экрана оставляй снаружи — тогда она стоит на месте, пока содержимое пружинит.
 */
export const OverscrollArea = ({ children, className }: OverscrollAreaProps) => {
  const { containerRef, offset, direction } = useOverscrollBounce()

  return (
    <motion.div
      ref={containerRef}
      className={className}
      style={{ y: offset, willChange: direction === 0 ? undefined : 'transform' }}
    >
      {children}
    </motion.div>
  )
}
