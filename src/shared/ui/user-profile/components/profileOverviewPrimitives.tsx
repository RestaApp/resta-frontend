import { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { OpenToWorkButton } from '@/shared/ui/OpenToWorkButton'
import { Card } from '@/components/ui/card'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'

/** Подпись секции профиля. */
export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className={PROFILE_SECTION_LABEL_CLASS}>{children}</div>
)

/** Карточка «открыт к работе» (только для сотрудника при наличии onToggle). */
export const ProfileOpenToWorkCard = ({
  visible,
  checked,
  disabled,
  onToggle,
}: {
  visible: boolean
  checked: boolean
  disabled?: boolean
  onToggle?: (nextValue: boolean) => void
}) => {
  if (!visible || !onToggle) return null

  return <OpenToWorkButton checked={checked} disabled={disabled} onToggle={onToggle} />
}

/** Сворачиваемая секция профиля (общий каркас для info- и work-history-секций). */
export const CollapsibleProfileSection = ({
  title,
  icon: Icon,
  variant,
  children,
}: {
  title: string
  icon?: LucideIcon
  variant: 'page' | 'drawer'
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(variant === 'drawer')

  const content = (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setIsOpen(value => !value)}
        data-haptic="light"
        className="flex w-full items-center gap-2 rounded-sm transition-colors hover:text-primary"
        aria-expanded={isOpen}
      >
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> : null}
        <h4 className={cn(SHIFT_CARD_TITLE_CLASS, 'min-w-0 flex-1 truncate text-left')}>{title}</h4>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto rounded-sm bg-secondary/60 p-1"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.span>
      </button>

      {isOpen ? (
        <motion.div
          initial={variant === 'drawer' ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      ) : null}
    </div>
  )

  return variant === 'drawer' ? (
    <div className="py-2">{content}</div>
  ) : (
    <Card className={SHIFT_CARD_CLASS}>{content}</Card>
  )
}
