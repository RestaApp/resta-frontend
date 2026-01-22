import { memo } from 'react'
import { Calendar, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { Card } from '@/components/ui/card'
import { PersonalShiftCard } from '@/features/activity/ui/components/PersonalShiftCard'
import { AppliedShiftCard } from '@/features/activity/ui/components/AppliedShiftCard'

type WeekDay = { date: string; short: string; full: string; dateObj: Date }
type GroupedShift = { id: number; type: 'resta' | 'personal'; data: any }

type Props = {
  isLoading: boolean
  isError: boolean
  weekDays: WeekDay[]
  groupedShifts: Record<string, GroupedShift[]>
  selectedDay: string
  onSelectDay: (day: string) => void
  selectedDayShifts: GroupedShift[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  isDeleting: boolean
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void
  onFindShift: () => void
}

export const ActivityCalendarTab = memo((props: Props) => {
  const {
    isLoading,
    isError,
    weekDays,
    groupedShifts,
    selectedDay,
    onSelectDay,
    selectedDayShifts,
    onEdit,
    onDelete,
    isDeleting,
    showToast,
    onFindShift,
  } = props

  if (isLoading) {
    return (
      <div className="space-y-3">
        <ShiftSkeleton />
        <ShiftSkeleton />
        <ShiftSkeleton />
      </div>
    )
  }
  if (isError) return <div className="text-center py-8 text-destructive">Ошибка загрузки смен</div>

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weekDays.map(day => {
          const dateKey = day.dateObj.toISOString().split('T')[0]
          const hasShifts = (groupedShifts[dateKey]?.length ?? 0) > 0
          const isSelected = selectedDay === day.date

          return (
            <button
              key={day.date}
              onClick={() => onSelectDay(day.date)}
              className="flex-shrink-0 flex flex-col items-center p-3 rounded-xl min-w-[60px] transition-all relative"
              style={{
                background: isSelected ? 'var(--gradient-primary)' : 'var(--muted)',
                color: isSelected ? 'white' : 'inherit',
              }}
            >
              <span className="text-xs mb-1">{day.short}</span>
              <span className="text-lg font-medium">{day.date}</span>
              {hasShifts && !isSelected ? (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
              ) : null}
            </button>
          )
        })}
      </div>

      <div>
        <h4 className="mb-3 text-lg font-semibold">{weekDays.find(d => d.date === selectedDay)?.full || 'День'}</h4>

        {selectedDayShifts.length > 0 ? (
          <div className="space-y-3">
            {selectedDayShifts.map(shift =>
              shift.type === 'resta' ? (
                <AppliedShiftCard key={shift.id} shift={shift.data} showToast={(m, t) => showToast(m, t)} />
              ) : (
                <PersonalShiftCard
                  key={shift.id}
                  shift={shift.data}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isDeleting={isDeleting}
                />
              )
            )}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8 px-4">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Свободный день!</p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 rounded-xl border-2 flex items-center gap-2 mx-auto"
                style={{ borderColor: 'var(--border)' }}
                onClick={onFindShift}
              >
                <Search className="w-4 h-4" />
                Найти смену
              </motion.button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
})
ActivityCalendarTab.displayName = 'ActivityCalendarTab'
