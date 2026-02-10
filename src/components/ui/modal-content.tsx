import { memo, useId, useEffect } from 'react'
import { motion } from 'motion/react'
import { Button } from './button'
import { Loader } from './loader'
import { cn } from '@/utils/cn'
import { useModalA11y } from './modal'
import type { ButtonProps } from './button'

export type ModalButton = {
  label: string
  onClick: () => void
  variant?: ButtonProps['variant']
  loading?: boolean
  disabled?: boolean
}

interface ModalActionButtonProps {
  label: string
  onClick: () => void
  variant?: ButtonProps['variant']
  loading?: boolean
  disabled?: boolean
  className?: string
}

const ModalActionButton = memo(function ModalActionButton({
  label,
  onClick,
  variant = 'primary',
  loading,
  disabled,
  className,
}: ModalActionButtonProps) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
      <Button
        variant={variant}
        onClick={onClick}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn('w-full rounded-xl', className)}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader size="sm" />
            {label}
          </span>
        ) : (
          label
        )}
      </Button>
    </motion.div>
  )
})

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
  const a11y = useModalA11y()
  const fallbackTitleId = useId()
  const fallbackDescId = useId()
  const titleId = a11y?.titleId ?? fallbackTitleId
  const descriptionId = a11y?.descriptionId ?? fallbackDescId

  useEffect(() => {
    a11y?.setHasDescription(!!description)
  }, [a11y, description])

  return (
    <div className={cn('w-full rounded-3xl border border-border bg-card p-6 shadow-xl', className)}>
      {icon && (
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
            {icon}
          </div>
        </div>
      )}

      <h2 id={titleId} className="mb-2 text-center text-xl font-semibold text-foreground">
        {title}
      </h2>

      {description ? (
        <p id={descriptionId} className="mb-6 whitespace-pre-line text-center text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}

      {(primaryButton || secondaryButton) && (
        <div className="flex gap-3">
          {secondaryButton ? (
            <ModalActionButton
              label={secondaryButton.label}
              onClick={secondaryButton.onClick}
              variant={secondaryButton.variant ?? 'outline'}
              loading={secondaryButton.loading}
              disabled={secondaryButton.disabled}
            />
          ) : null}
          {primaryButton ? (
            <ModalActionButton
              label={primaryButton.label}
              onClick={primaryButton.onClick}
              variant={primaryButton.variant ?? 'primary'}
              loading={primaryButton.loading}
              disabled={primaryButton.disabled}
            />
          ) : null}
        </div>
      )}
    </div>
  )
})
