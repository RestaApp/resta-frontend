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
    <div className="flex flex-col items-center justify-center py-12 gap-4 ui-density-page">
      <Loader size="lg" />
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  )
})
