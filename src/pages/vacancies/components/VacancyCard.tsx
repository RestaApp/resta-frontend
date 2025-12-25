import { MapPin, Clock, Bookmark, AlertCircle } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'

export type Vacancy = {
  id: string
  title: string
  venueName: string
  location: string
  schedule: string
  salary: string
  type: string
  category: string
  imageUrl?: string
  urgent?: boolean
  saved?: boolean
  description?: string
  requirements?: string
  shiftType?: 'vacancy' | 'replacement'
  canApply?: boolean
  applicationsCount?: number
  user?: {
    id: number
    name: string
    bio?: string
    phone?: string
    email?: string
    average_rating?: number
    total_reviews?: number
    restaurant_profile?: {
      city?: string
      cuisine_types?: string[]
      format?: string
    }
  }
}

interface VacancyCardProps {
  vacancy: Vacancy
  onApply?: (id: string) => void
  onSave?: (id: string) => void
  onClick?: (id: string) => void
}

export const VacancyCard = ({ vacancy, onApply, onSave, onClick }: VacancyCardProps) => {
  return (
    <Card
      className="p-5 glass hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer border border-border/50 shadow-sm"
      onClick={() => onClick?.(vacancy.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-[20px] font-semibold tracking-tight">{vacancy.venueName}</h3>
            {vacancy.urgent && (
              <Badge
                variant="destructive"
                className="gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold"
              >
                <AlertCircle className="w-3 h-3" />
                СРОЧНО
              </Badge>
            )}
          </div>
          <Badge variant="secondary" className="text-[13px] font-medium rounded-full px-3 py-1">
            {vacancy.title}
          </Badge>
        </div>
        <button
          onClick={e => {
            e.stopPropagation()
            onSave?.(vacancy.id)
          }}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          aria-label="Save vacancy"
        >
          <Bookmark
            className={`w-6 h-6 ${vacancy.saved ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
          />
        </button>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3 text-[15px] text-muted-foreground">
          <Clock className="w-[18px] h-[18px]" />
          <span className="font-medium">{vacancy.schedule}</span>
        </div>
        <div className="flex items-center gap-3 text-[15px] text-muted-foreground">
          <MapPin className="w-[18px] h-[18px]" />
          <span className="font-medium">{vacancy.location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div>
          <div className="text-[13px] text-muted-foreground mb-1">Оплата</div>
          <div className="text-[24px] font-bold tracking-tight text-primary">{vacancy.salary}</div>
          {vacancy.applicationsCount !== undefined && vacancy.applicationsCount > 0 && (
            <div className="text-[11px] text-muted-foreground mt-1">
              {vacancy.applicationsCount}{' '}
              {vacancy.applicationsCount === 1
                ? 'отклик'
                : vacancy.applicationsCount < 5
                  ? 'отклика'
                  : 'откликов'}
            </div>
          )}
        </div>
        <Button
          size="sm"
          onClick={e => {
            e.stopPropagation()
            onApply?.(vacancy.id)
          }}
          disabled={vacancy.canApply === false}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 h-10 font-semibold shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {vacancy.canApply === false ? 'Недоступно' : 'Откликнуться'}
        </Button>
      </div>
    </Card>
  )
}
