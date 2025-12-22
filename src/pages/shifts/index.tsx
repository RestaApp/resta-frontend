/**
 * Страница смен
 */

import { useState } from 'react'
import { Filter, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { AppHeader } from '../home/components/AppHeader'
import { ShiftCard } from './components/ShiftCard'
import { Button } from '../../components/ui/button'
import { cardAnimation, ANIMATION_DELAY_STEP } from '../../constants/animations'
import { useReplacementShifts } from '../../hooks/useReplacementShifts'
import type { Screen } from '../../types'

interface ShiftsScreenProps {
  onBack: () => void
  onNavigate?: (destination: Screen) => void
}

export function ShiftsScreen({ onNavigate, onBack }: ShiftsScreenProps) {
  void onBack
  const [savedShifts, setSavedShifts] = useState<string[]>([])

  // Получаем экстрасмены из API (только срочные)
  const { shifts, isLoading, isFetching } = useReplacementShifts()

  const handleApply = (id: string) => {
    const shift = shifts.find(s => s.id === id)
    // TODO: Реализовать отправку отклика на смену
    void shift
  }

  const handleSave = (id: string) => {
    setSavedShifts(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Экстра смены" onNavigate={onNavigate || (() => { })} />

      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4" />
            <span>Фильтры</span>
          </Button>

          <div className="text-[12px] text-muted-foreground ml-auto">
            {shifts.length}{' '}
            {shifts.length === 1 ? 'смена' : shifts.length < 5 ? 'смены' : 'смен'}
          </div>
        </div>

        {(isLoading || isFetching) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-muted-foreground animate-pulse" />
            </div>
            <p className="text-[14px] text-muted-foreground">Загрузка смен...</p>
          </div>
        )}

        {!isLoading && !isFetching && (
          <div className="space-y-3">
            {shifts.map((shift, index) => (
              <motion.div
                key={shift.id}
                initial={cardAnimation.initial}
                animate={cardAnimation.animate}
                transition={{ delay: ANIMATION_DELAY_STEP * index }}
              >
                <ShiftCard
                  shift={{ ...shift, saved: savedShifts.includes(shift.id) }}
                  onApply={handleApply}
                  onSave={handleSave}
                  onClick={id => {
                    void id
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && !isFetching && shifts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-[16px] font-medium mb-2">Срочные смены не найдены</h3>
            <p className="text-[14px] text-muted-foreground">
              В данный момент нет доступных срочных смен для замены
            </p>
          </div>
        )}
      </div>
    </div>
  )
}





