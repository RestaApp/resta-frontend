import { memo } from 'react'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SectionHeaderProps {
  title: string
  description?: string
  /** Мелкий текст под description */
  hint?: string
  icon?: LucideIcon
  count?: number
  align?: 'center' | 'left'
  className?: string
}

export const SectionHeader = memo(function SectionHeader({
  title,
  description,
  hint,
  icon: Icon,
  count,
  align = 'center',
  className,
}: SectionHeaderProps) {
  const isWithIcon = !!Icon

  if (isWithIcon && Icon) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={cn('flex items-center gap-2 mb-3', className)}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {count != null && count > 0 ? (
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count}</span>
        ) : null}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn(align === 'center' && 'text-center', className)}
    >
      <h2 className="mb-2 text-2xl font-semibold text-foreground">{title}</h2>
      {description ? <p className="text-muted-foreground">{description}</p> : null}
      {hint ? <p className="mt-1.5 text-sm text-muted-foreground/90">{hint}</p> : null}
    </motion.div>
  )
})
