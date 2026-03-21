import type { ReactNode } from 'react'
import { RoleSelector } from '@/features/role-selector/ui/RoleSelector'
import { OnboardingCompleteScreen } from '@/features/role-selector/ui/components/OnboardingCompleteScreen'
import { Dashboard } from '@/pages/Dashboard'
import { LoadingPage } from '@/pages/applications/components/Loading/LoadingPage'
import { useAppBootstrap } from '@/app/hooks/useAppBootstrap'
import { useTelegram } from '@/contexts/TelegramContext'
import { cn } from '@/utils/cn'

export const App = () => {
  const { isFullscreen } = useTelegram()
  const { screen, role, currentScreen, navigate, onSelectRole, onOnboardingComplete } =
    useAppBootstrap()

  let content: ReactNode

  if (screen === 'loading') {
    content = <LoadingPage />
  } else if (screen === 'onboarding_done') {
    content = <OnboardingCompleteScreen role={role} onComplete={onOnboardingComplete} />
  } else if (screen === 'role') {
    content = <RoleSelector onSelectRole={onSelectRole} />
  } else {
    content = <Dashboard role={role!} onNavigate={navigate} currentScreen={currentScreen} />
  }

  return (
    <div className={cn('bg-background min-h-[100dvh]', isFullscreen ? 'mt-[80px]' : 'mt-0')}>
      {content}
    </div>
  )
}
