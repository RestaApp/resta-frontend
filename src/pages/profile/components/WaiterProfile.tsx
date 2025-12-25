import { User, Settings, Star, MapPin, Briefcase } from 'lucide-react'

interface WaiterProfileProps {
  onFindReplacement: () => void
  onSettings: () => void
}

export const WaiterProfile = ({ onFindReplacement, onSettings }: WaiterProfileProps) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Профиль официанта</h1>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border mb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">Мария Петрова</h2>
              <p className="text-muted-foreground text-sm">Официант</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="text-sm font-medium">4.9</span>
                <span className="text-xs text-muted-foreground">(18 отзывов)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Санкт-Петербург</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Опыт: 3 года</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <button
            onClick={onFindReplacement}
            className="w-full bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-all text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Найти замену</h3>
                <p className="text-xs text-muted-foreground">Опубликовать смену</p>
              </div>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            onClick={onSettings}
            className="w-full bg-card rounded-2xl p-4 border border-border hover:shadow-md transition-all text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-chart-3/10 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <h3 className="font-medium">Настройки</h3>
                <p className="text-xs text-muted-foreground">Управление аккаунтом</p>
              </div>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border">
          <h3 className="font-medium mb-3">Статистика</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">15</div>
              <div className="text-xs text-muted-foreground">Смен</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">10</div>
              <div className="text-xs text-muted-foreground">Заведений</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">18</div>
              <div className="text-xs text-muted-foreground">Отзывов</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
