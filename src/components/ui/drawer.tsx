/**
 * Drawer (Bottom Sheet) — мобильный, лёгкий компонент
 *
 * Правила:
 * - Минималистичная реализация, без сторонних примесей
 * - Полная типизация пропсов
 * - Явные именованные экспорты
 * - Мемоизация для оптимизации производительности
 */

import React, { memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/utils/cn'

type DrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
  preventClose?: boolean
}

type OverlayProps = {
  className?: string
  onClick?: () => void
}

const DrawerOverlay = memo(({ className, onClick }: OverlayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      onClick={onClick}
      aria-hidden
    />
  )
})

DrawerOverlay.displayName = 'DrawerOverlay'

type DrawerContentProps = {
  className?: string
  children?: React.ReactNode
  onOpenChange: (open: boolean) => void
  preventClose?: boolean
}

const DrawerContent = memo(({
  className,
  children,
  onOpenChange,
  preventClose,
}: DrawerContentProps) => {
  const handleOverlayClick = useCallback(() => {
    if (!preventClose) {
      onOpenChange(false)
    }
  }, [preventClose, onOpenChange])

  return (
    <>
      <DrawerOverlay onClick={handleOverlayClick} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex h-auto max-h-[85vh] flex-col rounded-t-2xl border-t border-border bg-background shadow-xl',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-muted mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full" />
        {children}
      </motion.div>
    </>
  )
})

DrawerContent.displayName = 'DrawerContent'

function Drawer({ open, onOpenChange, children, preventClose }: DrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <DrawerContent onOpenChange={onOpenChange} preventClose={preventClose}>
          {children}
        </DrawerContent>
      )}
    </AnimatePresence>
  )
}

function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function DrawerTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot="drawer-title"
      className={cn('text-foreground font-semibold text-lg', className)}
      {...props}
    />
  )
}

function DrawerDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="drawer-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
