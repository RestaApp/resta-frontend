import { memo } from 'react'
import { motion } from 'motion/react'
import { Button } from './button'
import { Loader } from './loader'
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

export const ModalContent = memo(function ModalContent({
  icon,
  title,
  description,
  primaryButton,
  secondaryButton,
  className,
}: ModalContentProps) {
  const secondaryVariant = secondaryButton?.variant ?? 'outline'
  const primaryVariant = primaryButton?.variant ?? 'primary'
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
                variant={secondaryVariant}
                onClick={secondaryButton.onClick}
                disabled={secondaryButton.disabled || secondaryButton.isLoading}
                aria-busy={secondaryButton.isLoading || undefined}
                className="w-full rounded-xl"
              >
                {secondaryButton.isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader size="sm" />
                    {secondaryButton.label}
                  </span>
                ) : (
                  secondaryButton.label
                )}
              </Button>
            </motion.div>
          )}

          {primaryButton && (
            <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                variant={primaryVariant}
                onClick={primaryButton.onClick}
                disabled={primaryButton.disabled || primaryButton.isLoading}
                aria-busy={primaryButton.isLoading || undefined}
                className="w-full rounded-xl"
              >
                {primaryButton.isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader size="sm" />
                    {primaryButton.label}
                  </span>
                ) : (
                  primaryButton.label
                )}
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
})