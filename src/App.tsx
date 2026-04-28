import { Suspense, lazy, type ReactNode } from 'react'
import { LoadingPage } from '@/pages/applications/components/Loading/LoadingPage'
import { useAppBootstrap } from '@/app/hooks/useAppBootstrap'
import { useTelegram } from '@/contexts/TelegramContext'
import { cn } from '@/utils/cn'
import { RoleSelector } from '@/features/role-selector/ui/RoleSelector'

const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))

const AppShell = ({ children }: { children: ReactNode }) => {
  const { isFullscreen } = useTelegram()
  return (
    <div className={cn('bg-background min-h-[100dvh]', isFullscreen ? 'mt-[80px]' : 'mt-0')}>
      {children}
    </div>
  )
}

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

  return <Suspense fallback={null}>{content}</Suspense>
}

export const App = () => {
  return (
    <AppShell>
      <AppBootstrapRoutes />
    </AppShell>
  )
}
