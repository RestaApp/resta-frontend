import { useEffect } from 'react'
import { Button } from './button'
import { cn } from '../../utils/cn'

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-50">{children}</div>
    </div>
  )
}

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

export function AlertDialogContent({ children, className }: AlertDialogContentProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border shadow-lg rounded-3xl p-6 max-w-[90vw] w-full max-w-md',
        className
      )}
    >
      {children}
    </div>
  )
}

interface AlertDialogHeaderProps {
  children: React.ReactNode
}

export function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return <div className="mb-4">{children}</div>
}

interface AlertDialogTitleProps {
  children: React.ReactNode
}

export function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return <h2 className="text-lg font-semibold mb-2">{children}</h2>
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode
}

export function AlertDialogDescription({ children }: AlertDialogDescriptionProps) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

interface AlertDialogFooterProps {
  children: React.ReactNode
}

export function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return <div className="flex gap-3 justify-end mt-6">{children}</div>
}

interface AlertDialogActionProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function AlertDialogAction({ children, onClick, className }: AlertDialogActionProps) {
  return (
    <Button onClick={onClick} className={cn('rounded-xl', className)}>
      {children}
    </Button>
  )
}

interface AlertDialogCancelProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function AlertDialogCancel({ children, onClick, className }: AlertDialogCancelProps) {
  return (
    <Button variant="outline" onClick={onClick} className={cn('rounded-xl', className)}>
      {children}
    </Button>
  )
}
