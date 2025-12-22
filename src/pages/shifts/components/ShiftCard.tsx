/**
 * Компонент карточки смены
 */

import { MapPin, Clock, Bookmark, AlertCircle } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { getEmployeePositionLabel } from '../../../constants/labels'

export type Shift = {
  id: string
  restaurant: string
  role: string
  date: string
  time: string
  pay: number
  location: string
  urgent?: boolean
  saved?: boolean
  canApply?: boolean
  title?: string
  applicationsCount?: number
}

interface ShiftCardProps {
  shift: Shift
  onApply?: (id: string) => void
  onSave?: (id: string) => void
  onClick?: (id: string) => void
}

export function ShiftCard({ shift, onApply, onSave, onClick }: ShiftCardProps) {
  return (
    <Card
      className="p-5 glass hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer border border-border/50 shadow-sm"
      onClick={() => onClick?.(shift.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{shift.restaurant}</h3>
          {shift.title && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{shift.title}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {getEmployeePositionLabel(shift.role)}
            </Badge>
            {shift.urgent && (
              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Срочно
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={e => {
            e.stopPropagation()
            onSave?.(shift.id)
          }}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label={shift.saved ? 'Удалить из сохраненных' : 'Сохранить'}
        >
          <Bookmark
            className={`w-5 h-5 ${shift.saved ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
          />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            {shift.date} • {shift.time}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{shift.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-primary">
              {shift.pay} BYN
            </div>
            {shift.applicationsCount !== undefined && shift.applicationsCount > 0 && (
              <div className="text-[11px] text-muted-foreground mt-1">
                {shift.applicationsCount}{' '}
                {shift.applicationsCount === 1
                  ? 'отклик'
                  : shift.applicationsCount < 5
                    ? 'отклика'
                    : 'откликов'}
              </div>
            )}
          </div>
        </div>
      </div>

      {onApply && (
        <Button
          onClick={e => {
            e.stopPropagation()
            onApply(shift.id)
          }}
          disabled={shift.canApply === false}
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
          size="sm"
        >
          {shift.canApply === false ? 'Недоступно' : 'Откликнуться'}
        </Button>
      )}
    </Card>
  )
}





