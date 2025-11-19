import { Home, Briefcase, Search, User } from 'lucide-react'
import type { UserRole, Tab } from '../types'
import { isEmployeeRole } from '../utils/roles'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: string) => void
  role: UserRole
}

interface TabItem {
  id: Tab
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

export function BottomNav({ activeTab, onTabChange, role }: BottomNavProps) {
  const getTabsForRole = (): TabItem[] => {
    const baseTabs: TabItem[] = [{ id: 'home', label: 'Главная', icon: Home }]

    // Для сотрудников (повар, официант, бармен, бариста, администратор)
    if (isEmployeeRole(role)) {
      baseTabs.push(
        { id: 'vacancies', label: 'Вакансии', icon: Search },
        { id: 'shifts', label: 'Смены', icon: Briefcase }
      )
    }

    baseTabs.push({ id: 'profile', label: 'Профиль', icon: User })

    return baseTabs
  }

  const tabs = getTabsForRole()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center gap-1 py-2 px-4 transition-all duration-200"
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
