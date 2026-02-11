import { RoleSelector } from '@/features/role-selector/ui/RoleSelector'
import { OnboardingCompleteScreen } from '@/features/role-selector/ui/components/OnboardingCompleteScreen'
import { Dashboard } from '@/pages/Dashboard'
import { LoadingPage } from '@/pages/applications/components/Loading/LoadingPage'
import { useAppBootstrap } from '@/app/hooks/useAppBootstrap'

export const App = () => {
  const { screen, role, currentScreen, navigate, onSelectRole, onOnboardingComplete } =
    useAppBootstrap()

  if (screen === 'loading') return <LoadingPage />
  if (screen === 'onboarding_done') {
    return <OnboardingCompleteScreen onComplete={onOnboardingComplete} />
  }
  if (screen === 'role') return <RoleSelector onSelectRole={onSelectRole} />

  return (
    <div className="bg-background">
      <Dashboard role={role!} onNavigate={navigate} currentScreen={currentScreen} />
    </div>
  )
}
