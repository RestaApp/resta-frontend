import { MapPin, Clock, Calendar, Briefcase, Flame, Star, ChevronRight } from 'lucide-react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '../types'

interface UniversalCardProps {
    data: Shift | VacancyApiItem
    type?: 'replacement' | 'vacancy'
    isApplied?: boolean
    onAction: (id: number) => void
}

/**
 * Универсальная карточка для отображения смен и вакансий
 * Поддерживает оба типа данных с единым дизайном
 */
export const UniversalCard = ({ data, type, isApplied = false, onAction }: UniversalCardProps) => {
    // Определяем тип данных
    const isVacancy = type === 'vacancy' || (data as VacancyApiItem).shift_type === 'vacancy'
    const shiftData = data as Shift
    const vacancyData = data as VacancyApiItem

    // Извлекаем данные в зависимости от типа
    const title = isVacancy ? vacancyData.title : shiftData.position
    const restaurantName = isVacancy
        ? vacancyData.user?.name || vacancyData.user?.full_name || 'Ресторан'
        : shiftData.restaurant
    const rating = isVacancy
        ? vacancyData.user?.average_rating || 4.5
        : shiftData.rating
    const logo = isVacancy
        ? (vacancyData.user?.photo_url || '🍽️')
        : shiftData.logo
    const location = isVacancy
        ? vacancyData.location || vacancyData.user?.restaurant_profile?.city || ''
        : shiftData.location || ''

    // Обработка оплаты
    const paymentAmount = isVacancy
        ? (vacancyData.payment ? parseFloat(String(vacancyData.payment)) : 0)
        : shiftData.pay
    const currency = isVacancy ? 'BYN' : shiftData.currency

    // Обработка времени
    const getTimeData = () => {
        if (isVacancy) {
            const schedule = '5/2' // Можно добавить в API
            const hours = vacancyData.start_time && vacancyData.end_time
                ? `${new Date(vacancyData.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} - ${new Date(vacancyData.end_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
                : ''
            const duration = vacancyData.duration || ''
            return { schedule, hours, duration, date: undefined }
        } else {
            // Парсим время из формата "10:00 - 22:00 (12 ч.)"
            const timeParts = shiftData.time.split(' (')
            const hours = timeParts[0] || ''
            const duration = timeParts[1]?.replace(')', '') || shiftData.duration || ''
            return { schedule: undefined, hours, duration, date: shiftData.date }
        }
    }

    const timeData = getTimeData()
    const isUrgent = isVacancy ? vacancyData.urgent : false

    // Бейджи (можно расширить логику)
    const badges: string[] = []
    if (isUrgent) {
        badges.push('🔥 Срочно')
    }
    if (isVacancy && vacancyData.can_apply === false) {
        badges.push('Заполнено')
    }

    return (
        <div
            onClick={() => !isApplied && onAction(data.id)}
            className={`
                relative w-full rounded-[20px] p-4 border transition-all duration-200 active:scale-[0.98] cursor-pointer backdrop-blur-xl
                ${isUrgent
                    ? 'bg-gradient-glow border-purple-deep/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                    : 'bg-card border-border/50 shadow-sm hover:shadow-md'
                }
                ${isApplied ? 'opacity-60 cursor-not-allowed' : ''}
            `}
        >
            {/* 1. HEADER: Logo, Title, Price */}
            <div className="flex justify-between items-start gap-3 mb-3">
                {/* Logo */}
                <div className="relative">
                    <div className="w-12 h-12 bg-secondary/50 rounded-2xl flex items-center justify-center text-2xl border border-white/10 shadow-inner">
                        {logo}
                    </div>
                    {isUrgent && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-sm border-2 border-card">
                            <Flame size={12} fill="currentColor" />
                        </div>
                    )}
                </div>

                {/* Title & Restaurant */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[17px] leading-tight text-foreground truncate pr-2">
                        {title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <span className="truncate max-w-[120px]">{restaurantName}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <div className="flex items-center gap-0.5 text-amber-500 font-medium">
                            <Star size={10} fill="currentColor" />
                            {rating.toFixed(1)}
                        </div>
                    </div>
                </div>

                {/* Price Block */}
                <div className="text-right flex-shrink-0">
                    <div className="font-bold text-[19px] leading-tight text-primary">
                        {paymentAmount} <span className="text-sm align-top">{currency}</span>
                    </div>
                    <div className="text-[11px] font-medium text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-md inline-block mt-1">
                        {isVacancy ? 'в месяц' : 'за смену'}
                    </div>
                </div>
            </div>

            {/* 2. INFO GRID: Time & Location */}
            <div className="bg-secondary/30 rounded-xl p-3 mb-3 grid gap-2">
                {/* Row 1: Time/Date */}
                <div className="flex items-center gap-2.5 text-sm text-foreground/90">
                    {isVacancy ? (
                        <Briefcase className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    ) : (
                        <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    )}
                    <span className="font-medium">
                        {isVacancy ? timeData.schedule : timeData.date}
                    </span>

                    {/* Divider */}
                    {timeData.hours && (
                        <>
                            <span className="text-border">|</span>
                            <span className="text-muted-foreground flex items-center gap-1.5 overflow-hidden">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="truncate">{timeData.hours}</span>
                                {timeData.duration && (
                                    <span className="text-[10px] bg-secondary/80 px-1 rounded">
                                        {timeData.duration}
                                    </span>
                                )}
                            </span>
                        </>
                    )}
                </div>

                {/* Row 2: Location */}
                {location && (
                    <div className="flex items-center gap-2.5 text-sm text-foreground/90">
                        <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="truncate w-full">{location.replace('Минск, ', '')}</span>
                    </div>
                )}
            </div>

            {/* 3. FOOTER: Badges & Button */}
            <div className="flex items-center justify-between gap-3">
                {/* Tags/Badges */}
                <div className="flex gap-2 overflow-hidden flex-1 min-w-0">
                    {badges.map((badge, i) => (
                        <span
                            key={i}
                            className={`
                                px-2 py-1.5 rounded-lg text-[11px] font-medium border whitespace-nowrap
                                ${badge.includes('Срочно')
                                    ? 'bg-red-500/10 text-red-600 border-red-500/20 font-bold'
                                    : 'bg-secondary text-muted-foreground border-border/50'
                                }
                            `}
                        >
                            {badge}
                        </span>
                    ))}
                </div>

                {/* Action Button (Small) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        if (!isApplied) {
                            onAction(data.id)
                        }
                    }}
                    disabled={isApplied}
                    className={`
                        flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-transform flex-shrink-0
                        ${isApplied
                            ? 'bg-card/60 text-muted-foreground cursor-not-allowed'
                            : 'bg-primary text-primary-foreground shadow-purple-500/20 active:scale-90'
                        }
                    `}
                >
                    {isApplied ? (
                        <span className="text-sm">✓</span>
                    ) : (
                        <ChevronRight size={20} />
                    )}
                </button>
            </div>
        </div>
    )
}

