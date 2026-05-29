import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { SECTION_TITLE_CLASS, PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/utils/cn'
import { Badge } from '@/components/ui/badge'

export interface SectionHeaderProps {
  title: string
  description?: string
  /** Мелкий текст под description */
  hint?: string
  icon?: LucideIcon
  count?: number
  align?: 'center' | 'left'
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export const SectionHeader = function SectionHeader({
  title,
  description,
  hint,
  icon: Icon,
  count,
  align = 'left',
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  const isWithIcon = !!Icon

  if (isWithIcon) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={cn('flex items-center gap-2', className)}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className={cn(PROFILE_SECTION_LABEL_CLASS, titleClassName)}>{title}</h2>
        {count != null && count > 0 ? <Badge variant="outline">{count}</Badge> : null}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn('flex flex-col gap-3', align === 'center' && 'text-center', className)}
    >
      <h2 className={cn(SECTION_TITLE_CLASS, titleClassName)}>{title}</h2>
      {description || hint ? (
        <div className="flex flex-col gap-1">
          {description ? (
            <p className={cn('text-base text-muted-foreground leading-snug', descriptionClassName)}>
              {description}
            </p>
          ) : null}
          {hint ? <p className="text-sm text-muted-foreground/70">{hint}</p> : null}
        </div>
      ) : null}
    </motion.div>
  )
}
