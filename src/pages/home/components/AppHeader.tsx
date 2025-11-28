/**
 * Компонент заголовка приложения
 */

import { Bell } from 'lucide-react'
import logo from '../../../assets/icons/logo.svg'
import { ROUTES } from '../../../constants/routes'
import type { Screen } from '../../../types'

interface AppHeaderProps {
  onNavigate: (destination: Screen) => void
  subtitle?: string
  title?: string
}

export function AppHeader({ onNavigate, subtitle, title }: AppHeaderProps) {
  return (
    <div className="bg-card/60 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-md mx-auto px-6 py-4">
        {title ? (
          <h1 className="text-xl font-semibold">{title}</h1>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <img src={logo} alt="Resta" className="h-8" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate(ROUTES.NOTIFICATIONS)}
                  className="relative p-2 rounded-full hover:bg-muted/50 transition-colors"
                >
                  <Bell className="w-6 h-6" strokeWidth={2} />
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                </button>
              </div>
            </div>
            {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
          </>
        )}
      </div>
    </div>
  )
}


