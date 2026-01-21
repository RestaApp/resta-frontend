import { memo } from 'react'
import { motion } from 'motion/react'
import { Button } from './button'
import { cn } from '@/utils/cn'

export type ModalButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'

export interface ModalButton {
  label: string
  onClick: () => void
  variant?: ModalButtonVariant
  isLoading?: boolean
  disabled?: boolean
}

interface ModalContentProps {
  icon?: React.ReactNode
  title: string
  description?: string
  primaryButton?: ModalButton
  secondaryButton?: ModalButton
  className?: string
}

const mapVariantToButton = (variant?: ModalButtonVariant): React.ComponentProps<typeof Button>['variant'] => {
  if (!variant) return 'primary'
  return variant
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
    <div className={cn('w-full rounded-3xl border border-border bg-card p-6 shadow-xl', className)}>
      {icon && (
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
            {icon}
          </div>
        </div>
      )}

      <h2 className="mb-2 text-center text-xl font-semibold text-foreground">{title}</h2>

      {description && (
        <p className="mb-6 whitespace-pre-line text-center text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {(primaryButton || secondaryButton) && (
        <div className="flex gap-3">
          {secondaryButton && (
            <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                variant={mapVariantToButton(secondaryButton.variant ?? 'outline')}
                onClick={secondaryButton.onClick}
                disabled={secondaryButton.disabled || secondaryButton.isLoading}
                aria-busy={secondaryButton.isLoading || undefined}
                className="w-full rounded-xl"
              >
                {secondaryButton.isLoading ? 'Загрузка…' : secondaryButton.label}
              </Button>
            </motion.div>
          )}

          {primaryButton && (
            <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                variant={mapVariantToButton(primaryButton.variant)}
                onClick={primaryButton.onClick}
                disabled={primaryButton.disabled || primaryButton.isLoading}
                aria-busy={primaryButton.isLoading || undefined}
                className="w-full rounded-xl"
              >
                {primaryButton.isLoading ? 'Загрузка…' : primaryButton.label}
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
})