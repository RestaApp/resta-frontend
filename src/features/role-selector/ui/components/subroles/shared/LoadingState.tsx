/**
 * Компонент состояния загрузки
 */

import { memo } from 'react'
import { Loader } from '@/components/ui/loader'

interface LoadingStateProps {
  message?: string
}

export const LoadingState = memo(function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center py-12 gap-4">
      <Loader size="lg" />
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
    </div>
  )
})
