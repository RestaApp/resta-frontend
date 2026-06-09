import { memo, useId } from 'react'
import { motion } from 'motion/react'
import { Button } from './button'
import { Loader } from './loader'
import { cn } from '@/shared/utils/cn'
import { useModalA11y } from './modal-a11y'
import { FORMATTED_USER_TEXT_CLASS, MODAL_SURFACE_CLASS, MODAL_TITLE_CLASS } from './ui-patterns'
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
        className={cn('w-full', className)}
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

  return (
    <div className={cn(MODAL_SURFACE_CLASS, 'flex flex-col gap-4 p-6', className)}>
      {icon ? (
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
            {icon}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 text-center">
        <h2 id={titleId} className={MODAL_TITLE_CLASS}>
          {title}
        </h2>

        {description ? (
          <p
            id={descriptionId}
            className={cn('text-sm text-muted-foreground', FORMATTED_USER_TEXT_CLASS)}
          >
            {description}
          </p>
        ) : (
          <span id={descriptionId} className="sr-only" />
        )}
      </div>

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
