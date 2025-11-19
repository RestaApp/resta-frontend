import { useState } from 'react'
import { Filter } from 'lucide-react'
import { motion } from 'motion/react'
import { AppHeader } from './AppHeader'
import { ShiftCard, type Shift } from './ShiftCard'
import { Button } from './ui/button'
import { cardAnimation, ANIMATION_DELAY_STEP } from '../constants/animations'
import type { Screen } from '../types'

interface ShiftsScreenProps {
  onBack: () => void
  onNavigate?: (destination: Screen) => void
}

export function ShiftsScreen({ onNavigate, onBack }: ShiftsScreenProps) {
  void onBack // Неиспользуемый пропс, но требуется интерфейсом
  const [savedShifts, setSavedShifts] = useState<string[]>([])

  const mockShifts: Shift[] = [
    {
      id: '1',
      restaurant: 'Ресторан "Гастроном"',
      role: 'Повар',
      date: '25 января',
      time: '18:00 - 23:00',
      pay: 150,
      location: 'Минск, пр-т Независимости, 45',
      urgent: true,
    },
    {
      id: '2',
      restaurant: 'Бар "Коктейль"',
      role: 'Официант',
      date: 'Сегодня',
      time: '20:00 - 03:00',
      pay: 220,
      location: 'Минск, ул. Октябрьская, 15',
      urgent: true,
    },
    {
      id: '3',
      restaurant: 'Кофейня "Утро"',
      role: 'Официант',
      date: '26 января',
      time: '10:00 - 18:00',
      pay: 120,
      location: 'Минск, ул. Янки Купалы, 12',
    },
    {
      id: '4',
      restaurant: 'Банкетный зал "Премьера"',
      role: 'Официант',
      date: '27 января',
      time: '15:00 - 02:00',
      pay: 180,
      location: 'Минск, ул. Кальварийская, 8',
    },
    {
      id: '5',
      restaurant: 'Ресторан "Элегант"',
      role: 'Повар',
      date: '28 января',
      time: '19:00 - 01:00',
      pay: 200,
      location: 'Минск, пр-т Победителей, 23',
    },
  ]

  const handleApply = (id: string) => {
    const shift = mockShifts.find(s => s.id === id)
    console.log(`Отклик отправлен в ${shift?.restaurant}!`)
  }

  const handleSave = (id: string) => {
    setSavedShifts(prev => {
      if (prev.includes(id)) {
        console.log('Удалено из сохраненных')
        return prev.filter(s => s !== id)
      } else {
        console.log('Добавлено в избранное')
        return [...prev, id]
      }
    })
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Доска смен" onNavigate={onNavigate || (() => {})} />

      <div className="px-4 py-4 space-y-4">
        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Фильтры
          </Button>

          <div className="text-[12px] text-muted-foreground ml-auto">
            {mockShifts.length}{' '}
            {mockShifts.length === 1 ? 'смена' : mockShifts.length < 5 ? 'смены' : 'смен'}
          </div>
        </div>

        {/* Shifts List */}
        <div className="space-y-3">
          {mockShifts.map((shift, index) => (
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
                  console.log('Открыть смену:', id)
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
