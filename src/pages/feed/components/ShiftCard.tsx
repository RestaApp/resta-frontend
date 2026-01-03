import { MapPin, Clock, CalendarDays } from 'lucide-react'
import type { Shift } from '../types'
import type React from 'react'

interface ShiftCardProps {
    shift: Shift
    isApplied?: boolean
    onApply: (id: number) => void
}

export const ShiftCard = ({ shift, isApplied = false, onApply }: ShiftCardProps) => {
    const handleCardClick = (e: React.MouseEvent) => {
        // Предотвращаем открытие деталей при клике на кнопку
        if ((e.target as HTMLElement).closest('button')) {
            return
        }
        // Вызываем onApply для открытия деталей (будет переименовано)
        onApply(shift.id)
    }

    return (
        <div
            onClick={handleCardClick}
            className="group relative rounded-[20px] p-4 shadow-sm border border-border/50 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98] backdrop-blur-xl bg-card"
        >
            {/* Верхняя часть: Лого + Инфо + Цена */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                    {/* Логотип с мягкой тенью */}
                    <div className="flex-shrink-0 w-12 h-12 bg-secondary/50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/10">
                        {shift.logo}
                    </div>

                    <div>
                        <h3 className="font-bold text-base leading-tight pr-8">{shift.position}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{shift.restaurant}</p>

                        {/* Рейтинг (опционально, если есть место) */}
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium text-amber-500">
                            ★ {shift.rating}
                        </div>
                    </div>
                </div>

                {/* Блок цены - Самый заметный элемент */}
                <div className="text-right flex-shrink-0">
                    <div className="font-bold text-lg text-primary tracking-tight">
                        {shift.pay} <span className="text-sm font-normal text-muted-foreground">{shift.currency}</span>
                    </div>
                    {/* Если есть почасовая, можно вывести мелко снизу */}
                    <div className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md inline-block">
                        за смену
                    </div>
                </div>
            </div>

            {/* Средняя часть: Детали (Время, Адрес) */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-foreground/80 bg-secondary/30 p-2 rounded-xl">
                    <CalendarDays className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">{shift.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80 bg-secondary/30 p-2 rounded-xl">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-medium truncate">{shift.time}</span>
                </div>
            </div>

            <div className="flex items-center justify-between gap-2">
                {shift.location ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground flex-1 min-w-0">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-foreground/40" />
                        <span className="text-xs truncate font-medium">
                            {shift.location.replace('Минск, ', '')}
                        </span>
                    </div>
                ) : (
                    <div className="flex-1" />
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onApply(shift.id)
                    }}
                    disabled={isApplied}
                    className={`px-6 py-2 rounded-xl transition-all flex-shrink-0 ${isApplied ? 'bg-card/60 text-muted-foreground cursor-not-allowed' : 'gradient-primary text-white hover:opacity-90 shadow-md'}`}
                >
                    {isApplied ? '✓ Заявка отправлена' : 'Откликнуться'}
                </button>
            </div>
        </div>
    )
}