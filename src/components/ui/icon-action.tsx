import React, { memo } from 'react'
import { Button } from '@/components/ui/button'

export interface IconActionProps {
  title: string
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
  children: React.ReactNode
}

export const IconAction = memo(function IconAction({
  title,
  onClick,
  disabled,
  children,
}: IconActionProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="w-10 h-10 p-0"
    >
      {children}
    </Button>
  )
})

