import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PersonalShiftCard } from '@/features/activity/ui/components/PersonalShiftCard'
import { AppliedShiftCard } from '@/features/activity/ui/components/AppliedShiftCard'
import type { GroupedShift, WeekDay } from '@/features/activity/model/hooks/useActivityPageModel'

type Props = {
  isLoading: boolean
  isError: boolean
  weekDays: WeekDay[]
  groupedShifts: Record<string, GroupedShift[]>
  selectedDayKey: string
  onSelectDay: (dayKey: string) => void
  selectedDayShifts: GroupedShift[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  isDeleting: boolean
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void
  onFindShift: () => void
}

export const ActivityCalendarTab = memo((props: Props) => {
  const { t } = useTranslation()
  const {
    isLoading,
    isError,
    weekDays,
    groupedShifts,
    selectedDayKey,
    onSelectDay,
    selectedDayShifts,
    onEdit,
    onDelete,
    isDeleting,
    showToast,
    onFindShift,
  } = props
  const selectedDayMeta = useMemo(
    () => weekDays.find(d => d.key === selectedDayKey),
    [weekDays, selectedDayKey]
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <ShiftSkeleton />
        <ShiftSkeleton />
        <ShiftSkeleton />
      </div>
    )
  }
  if (isError)
    return <div className="text-center py-8 text-destructive">{t('feed.loadErrorShifts')}</div>

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weekDays.map(day => {
          const hasShifts = (groupedShifts[day.key]?.length ?? 0) > 0
          const isSelected = selectedDayKey === day.key

          return (
            <Button
              key={day.key}
              onClick={() => onSelectDay(day.key)}
              variant={isSelected ? 'gradient' : 'outline'}
              size="sm"
              className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl min-w-[60px] transition-all relative ${
                isSelected ? 'text-white' : 'bg-muted'
              }`}
              aria-pressed={isSelected}
            >
              <span className="text-xs mb-1">{day.short}</span>
              <span className="text-lg font-medium">{day.dayNum}</span>
              {hasShifts && !isSelected ? (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              ) : null}
            </Button>
          )
        })}
      </div>

      <div>
        <h4 className="mb-3 text-lg font-semibold">{selectedDayMeta?.full || t('activity.day')}</h4>

        {selectedDayShifts.length > 0 ? (
          <div className="space-y-4">
            {selectedDayShifts.map(shift =>
              shift.type === 'resta' ? (
                <AppliedShiftCard
                  key={shift.id}
                  shift={shift.data}
                  showToast={(m, type) => showToast(m, type)}
                />
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
              <p className="text-muted-foreground mb-4">{t('activity.freeDay')}</p>
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="md" className="mx-auto" onClick={onFindShift}>
                  <Search className="w-4 h-4" />
                  {t('activity.findShift')}
                </Button>
              </motion.div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
})
ActivityCalendarTab.displayName = 'ActivityCalendarTab'
