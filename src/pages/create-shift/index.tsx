import { AppHeader } from '../home/components/AppHeader'
import { Button } from '../../components/ui/button'
import type { Screen } from '../../types'

interface CreateShiftScreenProps {
  onBack: () => void
  onSubmit: () => void
  onNavigate?: (destination: Screen) => void
}

export function CreateShiftScreen({ onBack, onSubmit, onNavigate }: CreateShiftScreenProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Создать смену" onNavigate={onNavigate || (() => {})} />

      <div className="px-4 py-6">
        <div className="text-center py-12 text-muted-foreground">
          <p>Форма создания смены будет здесь</p>
          <Button onClick={onSubmit} className="mt-4">
            Опубликовать
          </Button>
          <Button variant="outline" onClick={onBack} className="mt-2">
            Назад
          </Button>
        </div>
      </div>
    </div>
  )
}
