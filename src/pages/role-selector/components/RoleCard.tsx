/**
 * Компонент карточки роли
 */

import { useCallback } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '../../../utils/cn'
import {
  roleCardAnimation,
  checkIconAnimation,
  ANIMATION_DELAY_STEP,
} from '../../../constants/animations'
import type { UserRole, RoleOption } from '../../../types'

interface RoleCardProps {
  role: RoleOption
  isSelected: boolean
  index: number
  onSelect: (roleId: UserRole) => void
}

export function RoleCard({ role, isSelected, index, onSelect }: RoleCardProps) {
  const Icon = role.icon

  const handleClick = useCallback(() => {
    const result = onSelect(role.id) as unknown
    // Если функция возвращает Promise, обрабатываем ошибки
    if (result && typeof result === 'object' && 'catch' in result) {
      (result as Promise<unknown>).catch(() => {
        // Ошибка обрабатывается автоматически
      })
    }
  }, [role.id, onSelect])

  const cardClasses = cn(
    'relative p-5 rounded-3xl text-left transition-all duration-300 w-full',
    isSelected
      ? 'bg-primary/10 border-2 border-primary shadow-lg scale-[1.02]'
      : 'bg-card/60 border-2 border-transparent backdrop-blur-xl hover:scale-[1.02] hover:shadow-md'
  )

  const iconContainerClasses = cn(
    'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md flex-shrink-0',
    role.color
  )

  return (
    <motion.button
      key={role.id}
      initial={roleCardAnimation.initial}
      animate={roleCardAnimation.animate}
      transition={{ delay: ANIMATION_DELAY_STEP * index }}
      onClick={handleClick}
      className={cardClasses}
      aria-pressed={isSelected}
      aria-label={`Выбрать роль: ${role.title}`}
    >
      <div className="flex items-center gap-4">
        <div className={iconContainerClasses}>
          <Icon className="w-8 h-8 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl mb-1 font-semibold">{role.title}</h3>
          <p className="text-sm text-muted-foreground leading-tight">{role.description}</p>
        </div>
        {isSelected && (
          <motion.div
            initial={checkIconAnimation.initial}
            animate={checkIconAnimation.animate}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <Check className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </div>
    </motion.button>
  )
}


