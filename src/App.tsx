import type { ReactNode } from 'react'
import { RoleSelector } from '@/features/role-selector/ui/RoleSelector'
import { OnboardingCompleteScreen } from '@/features/role-selector/ui/components/OnboardingCompleteScreen'
import { Dashboard } from '@/pages/Dashboard'
import { LoadingPage } from '@/pages/applications/components/Loading/LoadingPage'
import { useAppBootstrap } from '@/app/hooks/useAppBootstrap'
import { useTelegram } from '@/contexts/TelegramContext'
import { cn } from '@/utils/cn'

const AppShell = ({ children }: { children: ReactNode }) => {
  const { isFullscreen } = useTelegram()
  return (
    <div className={cn('bg-background min-h-[100dvh]', isFullscreen ? 'mt-[80px]' : 'mt-0')}>
      {children}
    </div>
  )
}

const AppBootstrapRoutes = () => {
  const { screen, role, currentScreen, navigate, onSelectRole, onOnboardingComplete } =
    useAppBootstrap()

  let content: ReactNode

  if (screen === 'loading') {
    content = <LoadingPage />
  } else if (screen === 'onboarding_done') {
    content = <OnboardingCompleteScreen role={role} onComplete={onOnboardingComplete} />
  } else if (screen === 'role') {
    content = <RoleSelector onSelectRole={onSelectRole} />
  } else if (!role) {
    content = <LoadingPage />
  } else {
    content = <Dashboard role={role} onNavigate={navigate} currentScreen={currentScreen} />
  }

  return <>{content}</>
}

export const App = () => {
  return (
    <AppShell>
      <AppBootstrapRoutes />
    </AppShell>
  )
}
