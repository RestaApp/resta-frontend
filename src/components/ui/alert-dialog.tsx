import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  memo,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/utils/cn'
import { Card } from './card'
import { Button } from './button'
import { MODAL_TITLE_CLASS, OVERLAY_SCRIM_CLASS, SHADOW_MODAL_CLASS } from './ui-patterns'
import { useBodyScrollLock } from '@/shared/lib/hooks/useBodyScrollLock'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { setupTelegramBackButton } from '@/shared/utils/telegram'

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  /** При true overlay click и Escape не закрывают диалог */
  preventClose?: boolean
}

const AlertDialogA11yContext = createContext<{ titleId: string; descriptionId: string } | null>(
  null
)
const AlertDialogRefContext = createContext<React.RefObject<HTMLDivElement | null> | null>(null)

function useAlertDialogA11y() {
  return useContext(AlertDialogA11yContext)
}

function useAlertDialogRef() {
  return useContext(AlertDialogRefContext)
}

export const AlertDialog = memo(function AlertDialog({
  open,
  onOpenChange,
  children,
  preventClose = false,
}: AlertDialogProps) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const onOpenChangeRef = useRef(onOpenChange)
  const preventCloseRef = useRef(preventClose)
  useLayoutEffect(() => {
    onOpenChangeRef.current = onOpenChange
    preventCloseRef.current = preventClose
  })

  const stableClose = useCallback(() => onOpenChangeRef.current(false), [])

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open || preventClose) return
    return setupTelegramBackButton(stableClose)
  }, [stableClose, open, preventClose])

  useEffect(() => {
    if (!open || typeof document === 'undefined') return

    const prevActive = document.activeElement as HTMLElement | null
    queueMicrotask(() => contentRef.current?.focus())

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventCloseRef.current) onOpenChangeRef.current(false)

      if (e.key === 'Tab' && contentRef.current) {
        const focusables = contentRef.current.querySelectorAll<HTMLElement>(
          'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])'
        )
        const list = Array.from(focusables).filter(
          el =>
            !el.hasAttribute('disabled') &&
            el.getAttribute('aria-hidden') !== 'true' &&
            el.offsetParent != null
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
      prevActive?.focus?.()
    }
  }, [open])

  if (!open) return null

  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (preventClose) return
    if (e.target === e.currentTarget) onOpenChange(false)
  }

  const node = (
    <AlertDialogRefContext.Provider value={contentRef}>
      <div
        className="fixed inset-0 flex items-center justify-center ui-density-page ui-density-py"
        role="presentation"
        style={{ zIndex: Z_INDEX.alertDialog }}
      >
        <div className={cn('fixed inset-0', OVERLAY_SCRIM_CLASS)} onClick={onOverlayClick} aria-hidden="true" />
        {children}
      </div>
    </AlertDialogRefContext.Provider>
  )

  return typeof document !== 'undefined' ? createPortal(node, document.body) : node
})

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

export const AlertDialogContent = memo(function AlertDialogContent({
  children,
  className,
}: AlertDialogContentProps) {
  const titleId = useId()
  const descriptionId = useId()
  const contentRef = useAlertDialogRef()

  return (
    <AlertDialogA11yContext.Provider value={{ titleId, descriptionId }}>
      {/* alertdialog — фокус-ловушка диалога; pointerdown/click stopPropagation
          нужен чтобы клик внутри окна не закрывал dialog (overlay click handler выше).
          Сам элемент не интерактивный, события обрабатывает только для bubbling‑guard. */}
      <Card
        ref={contentRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        padding="none"
        className={cn(
          'relative z-10 flex flex-col gap-4 outline-none rounded-2xl p-6 w-full max-w-md max-w-[90vw]',
          SHADOW_MODAL_CLASS,
          className
        )}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </Card>
    </AlertDialogA11yContext.Provider>
  )
})

export const AlertDialogHeader = memo(function AlertDialogHeader({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex flex-col gap-2">{children}</div>
})

export const AlertDialogTitle = memo(function AlertDialogTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ctx = useAlertDialogA11y()
  const fallbackId = useId()
  const id = ctx?.titleId ?? fallbackId
  return (
    <h2 id={id} className={cn(MODAL_TITLE_CLASS, className)}>
      {children}
    </h2>
  )
})

export const AlertDialogDescription = memo(function AlertDialogDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ctx = useAlertDialogA11y()
  const fallbackId = useId()
  const id = ctx?.descriptionId ?? fallbackId
  return (
    <p id={id} className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  )
})

export const AlertDialogFooter = memo(function AlertDialogFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex gap-3 justify-end', className)}>{children}</div>
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
    <Button onClick={onClick} className={className}>
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
    <Button variant="outline" onClick={onClick} className={className}>
      {children}
    </Button>
  )
})
