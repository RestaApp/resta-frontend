import { memo, useMemo } from 'react'
import { MapPin, Clock, CalendarDays } from 'lucide-react'
import { ActionButton } from '@/components/ui/ActionButton'
import type { Shift } from '../types'
import type React from 'react'
import { getEmployeePositionLabel, getSpecializationLabel } from '@/constants/labels'
import { getCurrentUserId } from '@/utils/user'

interface ShiftCardProps {
    shift: Shift
    isApplied?: boolean
    applicationId?: number | null
    onOpenDetails: (id: number) => void
    onApply: (id: number) => void
    onCancel: (applicationId: number | null | undefined, shiftId: number) => void
    isLoading?: boolean
    isVacancy?: boolean // Флаг для вакансий (оплата за месяц, а не за смену)
}

const ShiftCardComponent = ({ shift, isApplied = false, applicationId = null, onOpenDetails, onApply, onCancel, isLoading = false, isVacancy = false }: ShiftCardProps) => {
    const handleCardClick = (e: React.MouseEvent) => {
        // Предотвращаем открытие деталей при клике на кнопку
        if ((e.target as HTMLElement).closest('button')) {
            return
        }
        // Открываем детали смены
        onOpenDetails(shift.id)
    }

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        const currentUserId = getCurrentUserId()
        const isOwner = shift.ownerId !== undefined ? shift.ownerId === currentUserId : ((shift as any).user?.id === currentUserId)
        if (isOwner) return

        if (isApplied) {
            onCancel(applicationId ?? (shift as any).applicationId, shift.id)
        } else {
            onApply(shift.id)
        }
    }

    // Форматирование позиции и специализации
    const positionText = useMemo(() => {
        const position = getEmployeePositionLabel(shift.position)
        const specialization = shift.specialization
            ? ` • ${getSpecializationLabel(shift.specialization)}`
            : ''
        return `${position}${specialization}`
    }, [shift.position, shift.specialization])

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
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base leading-tight">{positionText}</h3>
                            <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                                ★ {shift.rating}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{shift.restaurant}</p>
                    </div>
                </div>

                {/* Блок цены - Самый заметный элемент */}
                <div className="text-right flex-shrink-0">
                    <div className="font-bold text-lg text-primary tracking-tight">
                        {shift.pay} <span className="text-sm font-normal text-muted-foreground">{shift.currency}</span>
                    </div>
                    {/* Если есть почасовая, можно вывести мелко снизу */}
                    <div className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md inline-block">
                        {isVacancy ? 'за месяц' : 'за смену'}
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
                {(() => {
                    const currentUserId = getCurrentUserId()
                    const isOwner = shift.ownerId !== undefined ? shift.ownerId === currentUserId : ((shift as any).user?.id === currentUserId)
                    if (isOwner) {
                        return null
                    }
                    return (
                        <ActionButton isLoading={isLoading} active={isApplied} onClick={handleButtonClick} disabled={isLoading}>
                            {isLoading ? (isApplied ? 'Отмена...' : 'Отправка...') : isApplied ? 'Отменить заявку' : 'Откликнуться'}
                        </ActionButton>
                    )
                })()}
            </div>
        </div>
    )
}

export const ShiftCard = memo(ShiftCardComponent)

ShiftCard.displayName = 'ShiftCard'
