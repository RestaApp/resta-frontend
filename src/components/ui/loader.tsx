import { memo } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<LoaderProps['size']>, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

export const Loader = memo(function Loader({ size = 'md', className }: LoaderProps) {

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.div
        className={cn('relative', SIZE_CLASSES[size])}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-purple-200/30 dark:border-purple-900/30" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 dark:border-t-purple-400"
          animate={{ rotate: 360 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute inset-[2px] rounded-full border-2 border-transparent border-r-pink-500 dark:border-r-pink-400"
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>
    </div>
  )
})
