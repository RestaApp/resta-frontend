/**
 * Компонент карточки роли
 */

import { memo, useMemo, useCallback } from 'react'
import { motion } from 'motion/react'
import { cn } from '../../../utils/cn'
import {
  roleCardAnimation,
  ANIMATION_DELAY_STEP,
} from '../../../constants/animations'
import type { UserRole, RoleOption } from '../../../types'

interface RoleCardProps {
  role: RoleOption
  isSelected: boolean
  index: number
  onSelect: (roleId: UserRole) => void
}

const CARD_BASE_CLASSES = 'group relative overflow-hidden bg-white rounded-2xl shadow-md transition-all duration-300 w-full p-6 border-2'
const ICON_CONTAINER_BASE_CLASSES = 'p-3 rounded-xl flex items-center justify-center flex-shrink-0'

export const RoleCard = memo(function RoleCard({ role, isSelected, index, onSelect }: RoleCardProps) {
  const Icon = role.icon

  const handleClick = useCallback(() => {
    onSelect(role.id)
  }, [role.id, onSelect])

  const cardClasses = useMemo(
    () =>
      cn(
        CARD_BASE_CLASSES,
        isSelected
          ? 'border-primary shadow-xl scale-[1.02]'
          : 'border-transparent hover:border-primary/50 hover:shadow-xl'
      ),
    [isSelected]
  )

  const iconContainerStyle = useMemo(
    () => ({
      background: 'var(--gradient-primary)',
    }),
    []
  )

  const transition = useMemo(
    () => ({
      delay: ANIMATION_DELAY_STEP * index,
      duration: 0.4,
    }),
    [index]
  )

  return (
    <motion.button
      initial={roleCardAnimation.initial}
      animate={roleCardAnimation.animate}
      transition={transition}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={cardClasses}
      aria-pressed={isSelected}
      aria-label={`Выбрать роль: ${role.title}`}
    >
      <div className="flex items-center gap-4">
        <div className={ICON_CONTAINER_BASE_CLASSES} style={iconContainerStyle}>
          <Icon className="w-6 h-6 text-white" aria-hidden="true" />
        </div>

        <div className="flex-1 text-left">
          <h3 className="text-lg mb-1 font-semibold text-foreground">{role.title}</h3>
          <p className="text-sm text-muted-foreground leading-tight">{role.description}</p>
        </div>
      </div>
    </motion.button>
  )
})


