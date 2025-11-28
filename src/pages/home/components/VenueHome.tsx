/**
 * Главная страница для заведения
 */

import type { Screen } from '../../../types'

interface VenueHomeProps {
  onNavigate: (destination: Screen) => void
}

export function VenueHome(_props: VenueHomeProps) {
  void _props
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-2">Добро пожаловать, Заведение!</h1>
        <p className="text-muted-foreground">Управляйте персоналом и поставщиками</p>
      </div>
    </div>
  )
}


