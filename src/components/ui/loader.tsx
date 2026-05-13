import { memo } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole } from '@/features/navigation/model/userSlice'
import { getRoleLoaderClasses } from '@/shared/lib/role-theme'

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
  const selectedRole = useAppSelector(selectSelectedRole)
  const spin = getRoleLoaderClasses(selectedRole ?? 'employee')

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
        <div className={cn('absolute inset-0 rounded-full border-2', spin.track)} />
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full border-2 border-transparent',
            spin.borderTop
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className={cn(
            'absolute inset-[2px] rounded-full border-2 border-transparent',
            spin.borderRight
          )}
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
