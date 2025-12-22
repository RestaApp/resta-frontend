import { useState } from 'react'
import { Filter, Zap, X } from 'lucide-react'
import { motion } from 'motion/react'
import { AppHeader } from '../home/components/AppHeader'
import { VacancyCard } from './components/VacancyCard'
import { VacancyDetailsScreen } from './components/VacancyDetailsScreen'
import { Button } from '../../components/ui/button'
import { cardAnimation, ANIMATION_DELAY_STEP } from '../../constants/animations'
import { useVacancies } from '../../hooks/useVacancies'
import type { Screen } from '../../types'

interface VacanciesScreenProps {
  onBack: () => void
  onNavigate?: (destination: Screen) => void
}

export function VacanciesScreen({ onNavigate, onBack }: VacanciesScreenProps) {
  void onBack // Неиспользуемый пропс, но требуется интерфейсом
  const [savedVacancies, setSavedVacancies] = useState<string[]>([])
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [category, setCategory] = useState('all')
  const [type, setType] = useState('all')
  const [urgentOnly, setUrgentOnly] = useState(false)

  const categoryFilters = [
    { id: 'all', label: 'Все' },
    { id: 'chef', label: 'Повара' },
    { id: 'waiter', label: 'Официанты' },
    { id: 'bartender', label: 'Бармены' },
    { id: 'barista', label: 'Бариста' },
  ]

  const typeFilters = [
    { id: 'all', label: 'Все' },
    { id: 'permanent', label: 'Постоянная' },
    { id: 'one-time', label: 'Одноразовая' },
  ]

  // Получаем вакансии из API
  const { vacancies, isLoading: isLoadingVacancies, isFetching: isFetchingVacancies } = useVacancies({
    category: category !== 'all' ? category : undefined,
    type: type !== 'all' ? type : undefined,
    urgentOnly,
  })

  const filteredVacancies = vacancies

  const handleApply = (id: string) => {
    const vacancy = vacancies.find(v => v.id === id)
    // TODO: Реализовать отправку отклика на вакансию
    void vacancy
  }

  const handleSave = (id: string) => {
    setSavedVacancies(prev => {
      if (prev.includes(id)) {
        return prev.filter(v => v !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Если выбрана вакансия, показываем детальный экран
  if (selectedVacancyId) {
    return (
      <VacancyDetailsScreen
        vacancyId={selectedVacancyId}
        vacancies={filteredVacancies}
        onBack={() => setSelectedVacancyId(null)}
        onNavigate={onNavigate}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Вакансии" onNavigate={onNavigate || (() => {})} />

      <div className="px-4 py-4 space-y-4">
        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
              showFilters || category !== 'all' || type !== 'all' || urgentOnly
                ? 'bg-primary/10 border-primary text-primary scale-105'
                : 'bg-card border-border text-foreground hover:bg-muted/50'
            }`}
          >
            <Filter
              className={`w-5 h-5 transition-transform duration-300 ${
                showFilters ? 'rotate-180' : 'rotate-0'
              }`}
              strokeWidth={2}
            />
            Фильтры
            {(category !== 'all' || type !== 'all' || urgentOnly) && (
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </button>

          <div className="text-[12px] text-muted-foreground ml-auto">
            {filteredVacancies.length}{' '}
            {filteredVacancies.length === 1
              ? 'вакансия'
              : filteredVacancies.length < 5
                ? 'вакансии'
                : 'вакансий'}
          </div>
        </div>

        {/* Filters Panel */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showFilters ? 'max-h-[500px] opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'
          }`}
        >
          <div className="p-4 bg-card rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Фильтры</h3>
              <button
                onClick={() => {
                  setCategory('all')
                  setType('all')
                  setUrgentOnly(false)
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Сбросить
              </button>
            </div>

            {/* Category Filters */}
            <div
              className={`mb-4 transition-all duration-300 delay-75 ${
                showFilters ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
            >
              <p className="text-sm text-muted-foreground mb-2">Категория</p>
              <div className="flex flex-wrap gap-2">
                {categoryFilters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setCategory(filter.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                      category === filter.id
                        ? 'bg-primary text-primary-foreground scale-105'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filters */}
            <div
              className={`mb-4 transition-all duration-300 delay-150 ${
                showFilters ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
            >
              <p className="text-sm text-muted-foreground mb-2">Тип занятости</p>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setType(filter.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                      type === filter.id
                        ? 'bg-chart-4 text-white scale-105'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgent Filter */}
            <div
              className={`transition-all duration-300 delay-200 ${
                showFilters ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Только срочные</p>
                <button
                  onClick={() => setUrgentOnly(!urgentOnly)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                    urgentOnly ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      urgentOnly ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            (category !== 'all' || type !== 'all' || urgentOnly) && !showFilters
              ? 'max-h-20 opacity-100 mb-4'
              : 'max-h-0 opacity-0 mb-0'
          }`}
        >
          <div className="flex flex-wrap gap-2">
            {category !== 'all' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm transition-all duration-300 ease-out">
                <span>{categoryFilters.find(f => f.id === category)?.label}</span>
                <button
                  onClick={() => setCategory('all')}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {type !== 'all' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-chart-4/10 text-chart-4 rounded-full text-sm transition-all duration-300 delay-75 ease-out">
                <span>{typeFilters.find(f => f.id === type)?.label}</span>
                <button
                  onClick={() => setType('all')}
                  className="hover:bg-chart-4/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {urgentOnly && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive rounded-full text-sm transition-all duration-300 delay-100 ease-out">
                <span>Срочные</span>
                <button
                  onClick={() => setUrgentOnly(false)}
                  className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Vacancies List */}
        {(isLoadingVacancies || isFetchingVacancies) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-muted-foreground animate-pulse" />
            </div>
            <p className="text-[14px] text-muted-foreground">Загрузка вакансий...</p>
          </div>
        )}

        {!isLoadingVacancies && !isFetchingVacancies && (
          <div className="space-y-3">
            {filteredVacancies.map((vacancy, index) => (
              <motion.div
                key={vacancy.id}
                initial={cardAnimation.initial}
                animate={cardAnimation.animate}
                transition={{ delay: ANIMATION_DELAY_STEP * index }}
              >
                <VacancyCard
                  vacancy={{ ...vacancy, saved: savedVacancies.includes(vacancy.id) }}
                  onApply={handleApply}
                  onSave={handleSave}
                  onClick={id => {
                    setSelectedVacancyId(id)
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {!isLoadingVacancies && !isFetchingVacancies && filteredVacancies.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-[16px] font-medium mb-2">Вакансии не найдены</h3>
            <p className="text-[14px] text-muted-foreground mb-4">
              Попробуйте изменить фильтры для расширения результатов
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setCategory('all')
                setType('all')
                setUrgentOnly(false)
              }}
            >
              Очистить фильтры
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
