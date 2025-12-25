/**
 * Базовый компонент модального окна
 * Используется для отображения диалогов, подтверждений и форм
 */

import { useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../../utils/cn'


interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export const Modal = memo(function Modal({
  isOpen,
  onClose,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Предотвращаем закрытие при клике на backdrop, если это модальное окно ошибки
    // (можно добавить пропс для управления этим поведением в будущем)
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Предотвращаем всплытие событий, которые могут закрыть drawer
    e.stopPropagation()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onMouseDown={handleBackdropMouseDown}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn('relative z-[60] w-full max-w-md', className)}
            onClick={e => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
})
