import { memo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerCloseButton,
} from '@/components/ui/drawer'

interface DrawerTitleBarProps {
  title: ReactNode
  onClose: () => void
  closeAriaLabel?: string
  /** Текст-описание под заголовком. */
  description?: ReactNode
  /** Доп. действия слева от крестика (например «Отметить все»). */
  actions?: ReactNode
  className?: string
}

/**
 * Шапка дровэра: заголовок + крестик (+ опц. описание/действия).
 * Единый каркас вместо повторяющегося `DrawerHeader > flex > Title + Close`.
 */
export const DrawerTitleBar = memo(function DrawerTitleBar({
  title,
  onClose,
  closeAriaLabel,
  description,
  actions,
  className,
}: DrawerTitleBarProps) {
  const { t } = useTranslation()
  const closeButton = (
    <DrawerCloseButton onClick={onClose} ariaLabel={closeAriaLabel ?? t('common.close')} />
  )

  return (
    <DrawerHeader className={className}>
      <div className="flex items-center justify-between gap-2">
        <DrawerTitle>{title}</DrawerTitle>
        {actions ? (
          <div className="flex items-center gap-1">
            {actions}
            {closeButton}
          </div>
        ) : (
          closeButton
        )}
      </div>
      {description ? <DrawerDescription>{description}</DrawerDescription> : null}
    </DrawerHeader>
  )
})
