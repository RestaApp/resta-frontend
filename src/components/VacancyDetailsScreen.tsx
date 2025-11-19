import { MapPin, Clock, DollarSign, FileText, MessageCircle, Bookmark, AlertCircle } from 'lucide-react'
import { AppHeader } from './AppHeader'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import type { Screen } from '../types'
import type { Vacancy } from './VacancyCard'

interface VacancyDetailsScreenProps {
  vacancyId: string
  vacancies: Vacancy[]
  onBack: () => void
  onNavigate?: (destination: Screen) => void
}

export function VacancyDetailsScreen({
  vacancyId,
  vacancies,
  onBack,
  onNavigate,
}: VacancyDetailsScreenProps) {
  const vacancy = vacancies.find(v => v.id === vacancyId)

  if (!vacancy) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Детали вакансии" onNavigate={onNavigate || (() => {})} />
        <div className="px-4 py-8 text-center">
          <p>Вакансия не найдена</p>
          <Button onClick={onBack} className="mt-4">
            Назад к вакансиям
          </Button>
        </div>
      </div>
    )
  }

  const handleApply = () => {
    console.log(`Отклик отправлен в ${vacancy.venueName}!`)
  }

  const handleContact = () => {
    console.log('Открытие чата Telegram...')
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      chef: 'Повар',
      waiter: 'Официант',
      bartender: 'Бармен',
      barista: 'Бариста',
    }
    return labels[category] || category
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <AppHeader title="Детали вакансии" onNavigate={onNavigate || (() => {})} />

      <div className="px-4 py-6 space-y-6">
        {/* Header Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-[22px] font-medium mb-2">{vacancy.venueName}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{vacancy.title}</Badge>
                {vacancy.urgent && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="w-3 h-3" />
                    URGENT
                  </Badge>
                )}
              </div>
            </div>
            <button className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-primary transition-colors">
              <Bookmark
                className={`w-6 h-6 ${vacancy.saved ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
              />
            </button>
          </div>
          <Separator className="my-4" />

          {/* Key Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-[12px] text-muted-foreground mb-1">График работы</div>
                <div className="text-[14px]">{vacancy.schedule}</div>
                <div className="text-[12px] text-muted-foreground mt-1">{vacancy.type}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-[12px] text-muted-foreground mb-1">Место</div>
                <div className="text-[14px]">{vacancy.location}</div>
                <button className="text-[12px] text-primary hover:underline mt-1">
                  Посмотреть на карте
                </button>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-[12px] text-muted-foreground mb-1">Оплата</div>
                <div className="text-[18px] font-semibold text-primary">{vacancy.salary}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Requirements */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-[16px] font-medium">Требования</h2>
          </div>
          <ul className="space-y-2 text-[14px]">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                Минимум 2 года опыта работы в должности {getCategoryLabel(vacancy.category).toLowerCase()}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Действующая медицинская книжка обязательна</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Профессиональный внешний вид и отношение к работе</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Пунктуальность и ответственность</span>
            </li>
            {vacancy.type === 'Постоянная' && (
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Готовность к работе в команде и обучению</span>
              </li>
            )}
          </ul>
        </Card>

        {/* Description */}
        <Card className="p-6">
          <h2 className="text-[16px] font-medium mb-3">О вакансии</h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Мы ищем опытного {getCategoryLabel(vacancy.category).toLowerCase()} для{' '}
            {vacancy.type === 'Постоянная' ? 'постоянной работы' : 'разового мероприятия'} в{' '}
            {vacancy.venueName}. Это отличная возможность поработать в профессиональной среде с
            преданной командой.{' '}
            {vacancy.urgent
              ? 'В связи со срочностью, мы предлагаем повышенную оплату.'
              : vacancy.type === 'Постоянная'
                ? 'Мы предлагаем стабильный график и возможности для профессионального роста.'
                : ''}
          </p>
        </Card>

        {/* Venue Info */}
        <Card className="p-6">
          <h2 className="text-[16px] font-medium mb-3">О заведении</h2>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-[16px] font-bold text-primary">
                {vacancy.venueName.charAt(0)}
              </span>
            </div>
            <div>
              <div className="text-[14px] font-medium">{vacancy.venueName}</div>
              <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                <span>⭐ 4.8</span>
                <span>•</span>
                <span>24 отзыва</span>
              </div>
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground">
            {vacancy.category === 'chef' || vacancy.category === 'waiter'
              ? 'Ресторан европейской кухни в центре Минска'
              : vacancy.category === 'barista'
                ? 'Современная кофейня с уютной атмосферой'
                : 'Премиальное заведение с высоким уровнем сервиса'}
          </p>
        </Card>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 max-w-[390px] mx-auto">
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleContact} className="flex-1 gap-2">
            <MessageCircle className="w-4 h-4" />
            Связаться
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Откликнуться
          </Button>
        </div>
      </div>
    </div>
  )
}

