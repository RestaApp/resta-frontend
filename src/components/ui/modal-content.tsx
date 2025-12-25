/**
 * Компонент содержимого модального окна
 * Поддерживает иконку, заголовок, описание и кнопки
 */

import { memo } from 'react'
import { motion } from 'motion/react'
import { Button } from './button'
import { cn } from '../../utils/cn'


export interface ModalButton {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'destructive'
  isLoading?: boolean
}

interface ModalContentProps {
  icon?: React.ReactNode
  title: string
  description?: string
  primaryButton?: ModalButton
  secondaryButton?: ModalButton
  className?: string
}

export const ModalContent = memo(function ModalContent({
  icon,
  title,
  description,
  primaryButton,
  secondaryButton,
  className,
}: ModalContentProps) {
  return (
    <div className={cn('bg-card border border-border shadow-xl rounded-3xl p-6 w-full', className)}>
      {/* Icon */}
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/50">
            {icon}
          </div>
        </div>
      )}

      {/* Title */}
      <h2 className="text-xl font-semibold text-center mb-2">{title}</h2>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground text-center mb-6 whitespace-pre-line">
          {description}
        </p>
      )}

      {/* Buttons */}
      {(primaryButton || secondaryButton) && (
        <div className="flex gap-3">
          {secondaryButton && (
            <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                variant="outline"
                onClick={secondaryButton.onClick}
                disabled={secondaryButton.isLoading}
                className="w-full rounded-xl"
              >
                {secondaryButton.label}
              </Button>
            </motion.div>
          )}

          {primaryButton && (
            <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                variant={primaryButton.variant === 'destructive' ? 'destructive' : 'default'}
                onClick={primaryButton.onClick}
                disabled={primaryButton.isLoading}
                className="w-full rounded-xl"
              >
                {primaryButton.isLoading ? 'Загрузка...' : primaryButton.label}
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
})

