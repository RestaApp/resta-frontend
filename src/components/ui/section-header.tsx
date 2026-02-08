import { memo } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'

interface SectionHeaderProps {
  title: string
  description?: string
  /** Дополнительная подсказка (мелкий текст под description) */
  hint?: string
  className?: string
}

export const SectionHeader = memo(function SectionHeader({
  title,
  description,
  hint,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn('text-center', className)}
    >
      <h2 className="mb-2 text-2xl font-semibold text-foreground">{title}</h2>

      {description ? (
        <p className="text-muted-foreground">{description}</p>
      ) : null}
      {hint ? (
        <p className="mt-1.5 text-sm text-muted-foreground/90">{hint}</p>
      ) : null}
    </motion.div>
  )
})