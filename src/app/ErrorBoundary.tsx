import { Component, type ErrorInfo, type ReactNode } from 'react'
import i18n from '@/shared/i18n/config'
import { Button } from '@/components/ui/button'
import { logger } from '@/shared/utils/logger'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Корневой Error Boundary: ловит ошибки рендера и показывает fallback с
 * перезагрузкой вместо «белого экрана» Mini App (выйти из него в Telegram
 * пользователь сам не может). Логирует через общий logger.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Unhandled render error', error, info.componentStack)
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-lg font-semibold text-foreground">{i18n.t('errors.boundaryTitle')}</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          {i18n.t('errors.boundaryDescription')}
        </p>
        <Button variant="gradient" size="md" onClick={this.handleReload}>
          {i18n.t('errors.boundaryReload')}
        </Button>
      </div>
    )
  }
}
