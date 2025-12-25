/**
 * Универсальный компонент заголовка и описания секции
 */

import { memo } from 'react'
import { motion } from 'motion/react'


interface SectionHeaderProps {
  title: string
  description: string
  className?: string
}

export const SectionHeader = memo(function SectionHeader({
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <h2 className="text-center text-2xl font-semibold mb-2 text-foreground">{title}</h2>
      <motion.p
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center text-muted-foreground"
      >
        {description}
      </motion.p>
    </motion.div>
  )
})
