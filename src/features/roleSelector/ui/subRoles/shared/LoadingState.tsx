/**
 * Компонент состояния загрузки
 */

import { memo } from 'react'

interface LoadingStateProps {
  message: string
}

export const LoadingState = memo(function LoadingState({
  message,
}: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
})
