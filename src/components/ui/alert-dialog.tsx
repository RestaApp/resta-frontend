import { useEffect, useRef, memo } from 'react'
import { cn } from '@/utils/cn'
import { Button } from './button'

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

let openModalCount = 0

const lockBodyScroll = () => {
  const { body } = document
  if (openModalCount === 0) {
    body.dataset.prevOverflow = body.style.overflow
    body.style.overflow = 'hidden'
  }
  openModalCount += 1
}

const unlockBodyScroll = () => {
  const { body } = document
  openModalCount = Math.max(0, openModalCount - 1)
  if (openModalCount === 0) {
    body.style.overflow = body.dataset.prevOverflow ?? ''
    delete body.dataset.prevOverflow
  }
}

export const AlertDialog = memo(function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open || typeof document === 'undefined') return

    lockBodyScroll()
    const prevActive = document.activeElement as HTMLElement | null

    queueMicrotask(() => contentRef.current?.focus())

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)

      // простой focus trap
      if (e.key === 'Tab' && contentRef.current) {
        const focusables = contentRef.current.querySelectorAll<HTMLElement>(
          'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])'
        )
        const list = Array.from(focusables).filter(
          el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
        )

        if (list.length === 0) {
          e.preventDefault()
          return
        }

        const first = list[0]
        const last = list[list.length - 1]
        const active = document.activeElement

        if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      unlockBodyScroll()
      prevActive?.focus?.()
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onPointerDown={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        ref={contentRef}
        className="relative z-50 outline-none"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
})

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

export const AlertDialogContent = memo(function AlertDialogContent({ children, className }: AlertDialogContentProps) {
  return (
    <div className={cn('bg-card border border-border shadow-lg rounded-3xl p-6 w-full max-w-md max-w-[90vw]', className)}>
      {children}
    </div>
  )
})

export const AlertDialogHeader = memo(function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>
})

export const AlertDialogTitle = memo(function AlertDialogTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <h2 className={cn('text-lg font-semibold mb-2', className)}>{children}</h2>
})

export const AlertDialogDescription = memo(function AlertDialogDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
})

export const AlertDialogFooter = memo(function AlertDialogFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex gap-3 justify-end mt-6', className)}>{children}</div>
})

export const AlertDialogAction = memo(function AlertDialogAction({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <Button onClick={onClick} className={cn('rounded-xl', className)}>
      {children}
    </Button>
  )
})

export const AlertDialogCancel = memo(function AlertDialogCancel({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <Button variant="outline" onClick={onClick} className={cn('rounded-xl', className)}>
      {children}
    </Button>
  )
})