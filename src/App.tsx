import { Suspense, lazy, type ReactNode } from 'react'
import { LoadingPage } from '@/components/ui/LoadingPage'
import { useAppBootstrap } from '@/app/hooks/useAppBootstrap'
import { TelegramMiniAppShell } from '@/components/ui/TelegramMiniAppShell'
import { SwipeBackGesture } from '@/app/SwipeBackGesture'
import { ErrorBoundary } from '@/app/ErrorBoundary'
import { RoleSelector } from '@/features/role-selector/ui/RoleSelector'
import { DetailOverlayProvider } from '@/shared/navigation/DetailOverlayContext'
import { ToastProvider } from '@/shared/lib/toast/ToastProvider'
import { PurchaseFlowProvider } from '@/features/monetization/ui/PurchaseFlowProvider'

const Dashboard = lazy(() =>
  import('@/pages/Dashboard/Dashboard').then(m => ({ default: m.Dashboard }))
)

/**
 * Маршрутизация bootstrap:
 *   loading  → LoadingPage (Telegram-init, auth, post-logout)
 *   role     → RoleSelector  (он же «role pending / unverified»: пользователь
 *              авторизован в TG, но роль ещё не выбрана — CTA «Выбрать роль»
 *              ведёт по веткам онбординга)
 *   dashboard → role-specific Dashboard
 */
const AppBootstrapRoutes = () => {
  const { screen, role, currentScreen, navigate, onSelectRole } = useAppBootstrap()

  let content: ReactNode

  if (screen === 'loading') {
    content = <LoadingPage />
  } else if (screen === 'role') {
    content = <RoleSelector onSelectRole={onSelectRole} />
  } else if (!role) {
    content = <LoadingPage />
  } else {
    content = <Dashboard role={role} onNavigate={navigate} currentScreen={currentScreen} />
  }

  return <Suspense fallback={<LoadingPage />}>{content}</Suspense>
}

export const App = () => {
  return (
    <TelegramMiniAppShell>
      <ErrorBoundary>
        <ToastProvider>
          <PurchaseFlowProvider>
            <DetailOverlayProvider>
              <SwipeBackGesture />
              <AppBootstrapRoutes />
            </DetailOverlayProvider>
          </PurchaseFlowProvider>
        </ToastProvider>
      </ErrorBoundary>
    </TelegramMiniAppShell>
  )
}
