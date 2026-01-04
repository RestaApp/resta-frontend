import {
  MapPin,
  Clock,
  DollarSign,
  FileText,
  MessageCircle,
  Bookmark,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Screen } from '@/types'
import type { Vacancy } from '@/pages/vacancies/components/VacancyCard'

interface VacancyDetailsScreenProps {
  vacancyId: string
  vacancies: Vacancy[]
  onBack: () => void
  onNavigate?: (destination: Screen) => void
}

export const VacancyDetailsScreen = ({
  vacancyId,
  vacancies,
  onBack,
}: VacancyDetailsScreenProps) => {
  const vacancy = vacancies.find(v => v.id === vacancyId)

  if (!vacancy) {
    return (
      <div className="min-h-screen bg-background">
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
    // TODO: Реализовать отправку отклика на вакансию
  }

  const handleContact = () => {
    // TODO: Реализовать открытие чата Telegram
  }

  return (
    <div className="min-h-screen bg-background pb-32">

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
        {vacancy.requirements && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-[16px] font-medium">Требования</h2>
            </div>
            <div className="text-[14px] text-muted-foreground leading-relaxed whitespace-pre-line">
              {vacancy.requirements}
            </div>
          </Card>
        )}

        {/* Description */}
        {vacancy.description && (
          <Card className="p-6">
            <h2 className="text-[16px] font-medium mb-3">О вакансии</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed whitespace-pre-line">
              {vacancy.description}
            </p>
          </Card>
        )}

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
              {vacancy.user && (
                <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                  {vacancy.user.average_rating !== undefined && vacancy.user.average_rating > 0 && (
                    <>
                      <span>⭐ {vacancy.user.average_rating.toFixed(1)}</span>
                      {vacancy.user.total_reviews !== undefined &&
                        vacancy.user.total_reviews > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              {vacancy.user.total_reviews}{' '}
                              {vacancy.user.total_reviews === 1
                                ? 'отзыв'
                                : vacancy.user.total_reviews < 5
                                  ? 'отзыва'
                                  : 'отзывов'}
                            </span>
                          </>
                        )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          {vacancy.user?.bio && (
            <p className="text-[12px] text-muted-foreground mb-2">{vacancy.user.bio}</p>
          )}
          {vacancy.user?.restaurant_profile && (
            <div className="flex flex-wrap gap-2 mt-2">
              {vacancy.user.restaurant_profile.city && (
                <Badge variant="outline" className="text-[11px]">
                  {vacancy.user.restaurant_profile.city}
                </Badge>
              )}
              {vacancy.user.restaurant_profile.format && (
                <Badge variant="outline" className="text-[11px]">
                  {vacancy.user.restaurant_profile.format}
                </Badge>
              )}
              {vacancy.user.restaurant_profile.cuisine_types &&
                vacancy.user.restaurant_profile.cuisine_types.length > 0 && (
                  <Badge variant="outline" className="text-[11px]">
                    {vacancy.user.restaurant_profile.cuisine_types.join(', ')}
                  </Badge>
                )}
            </div>
          )}
          {vacancy.user?.phone && (
            <div className="mt-3 text-[12px] text-muted-foreground">
              <span className="font-medium">Телефон: </span>
              {vacancy.user.phone}
            </div>
          )}
        </Card>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 max-w-[390px] mx-auto">
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleContact} className="flex-1">
            <MessageCircle className="w-4 h-4" />
            <span>Связаться</span>
          </Button>
          <Button
            onClick={handleApply}
            disabled={vacancy.canApply === false}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {vacancy.canApply === false ? 'Недоступно' : 'Откликнуться'}
          </Button>
        </div>
      </div>
    </div>
  )
}
