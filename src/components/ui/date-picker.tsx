import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../../utils/cn'

interface DatePickerProps {
    value: string | null // YYYY-MM-DD
    onChange: (date: string | null) => void
    placeholder?: string
    minDate?: string // YYYY-MM-DD
    className?: string
    label?: string
    useNative?: boolean // Принудительно использовать нативный календарь
}

/**
 * Определяет, является ли устройство мобильным
 */
const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false

    // Проверяем User Agent
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())

    // Проверяем размер экрана (дополнительная проверка)
    const isSmallScreen = window.innerWidth <= 768

    // Проверяем наличие touch событий
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    return isMobileUA || (isSmallScreen && hasTouch)
}

const MONTHS = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export const DatePicker = ({
    value,
    onChange,
    placeholder = 'ДД.ММ.ГГГГ',
    minDate,
    className,
    label,
    useNative,
}: DatePickerProps) => {
    // Определяем, использовать ли нативный календарь
    const shouldUseNative = useMemo(() => {
        if (useNative !== undefined) return useNative
        return isMobileDevice()
    }, [useNative])

    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (value) {
            const date = new Date(value)
            return { year: date.getFullYear(), month: date.getMonth() }
        }
        const today = new Date()
        return { year: today.getFullYear(), month: today.getMonth() }
    })
    const containerRef = useRef<HTMLDivElement>(null)

    // Закрываем календарь при клике вне его
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    // Форматируем дату для отображения (DD.MM.YYYY)
    const formatDateForDisplay = useCallback((dateString: string | null): string => {
        if (!dateString) return ''
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return ''
            const day = String(date.getDate()).padStart(2, '0')
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const year = date.getFullYear()
            return `${day}.${month}.${year}`
        } catch {
            return ''
        }
    }, [])

    // Получаем минимальную дату (сегодня или переданная)
    const getMinDate = useCallback((): Date => {
        if (minDate) {
            return new Date(minDate)
        }
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return today
    }, [minDate])

    // Проверяем, можно ли выбрать дату
    const isDateDisabled = useCallback((date: Date): boolean => {
        const min = getMinDate()
        date.setHours(0, 0, 0, 0)
        return date < min
    }, [getMinDate])

    // Генерируем дни месяца
    const getDaysInMonth = useCallback((year: number, month: number): Date[] => {
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const days: Date[] = []

        // Добавляем дни предыдущего месяца для заполнения первой недели
        const startDay = firstDay.getDay()
        const adjustedStartDay = startDay === 0 ? 6 : startDay - 1 // Понедельник = 0

        for (let i = adjustedStartDay - 1; i >= 0; i--) {
            const date = new Date(year, month, -i)
            days.push(date)
        }

        // Добавляем дни текущего месяца
        for (let day = 1; day <= lastDay.getDate(); day++) {
            days.push(new Date(year, month, day))
        }

        // Добавляем дни следующего месяца для заполнения последней недели
        const remainingDays = 42 - days.length // 6 недель * 7 дней
        for (let day = 1; day <= remainingDays; day++) {
            days.push(new Date(year, month + 1, day))
        }

        return days
    }, [])

    const days = getDaysInMonth(currentMonth.year, currentMonth.month)
    const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.month

    const handleDateSelect = useCallback((date: Date) => {
        if (isDateDisabled(date)) return

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateString = `${year}-${month}-${day}`

        onChange(dateString)
        setIsOpen(false)
    }, [onChange, isDateDisabled])

    const handlePrevMonth = useCallback(() => {
        setCurrentMonth(prev => {
            if (prev.month === 0) {
                return { year: prev.year - 1, month: 11 }
            }
            return { year: prev.year, month: prev.month - 1 }
        })
    }, [])

    const handleNextMonth = useCallback(() => {
        setCurrentMonth(prev => {
            if (prev.month === 11) {
                return { year: prev.year + 1, month: 0 }
            }
            return { year: prev.year, month: prev.month + 1 }
        })
    }, [])

    // Обновляем текущий месяц при изменении значения
    useEffect(() => {
        if (value) {
            const date = new Date(value)
            setCurrentMonth({ year: date.getFullYear(), month: date.getMonth() })
        }
    }, [value])

    // Обработчик изменения нативного input
    const handleNativeDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value || null
        onChange(dateValue)
    }, [onChange])

    // Если используем нативный календарь
    if (shouldUseNative) {
        return (
            <div className={cn('relative', className)}>
                {label && (
                    <label className="text-sm text-muted-foreground mb-2 block">{label}</label>
                )}
                <div className="relative">
                    <input
                        type="date"
                        value={value || ''}
                        onChange={handleNativeDateChange}
                        min={minDate || new Date().toISOString().split('T')[0]}
                        className={cn(
                            'w-full px-3 py-2 pr-10 bg-card/60 border border-border rounded-xl',
                            'text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                            'transition-all',
                            // Скрываем стандартную иконку календаря
                            '[&::-webkit-calendar-picker-indicator]:opacity-0',
                            '[&::-webkit-calendar-picker-indicator]:absolute',
                            '[&::-webkit-calendar-picker-indicator]:inset-0',
                            '[&::-webkit-calendar-picker-indicator]:w-full',
                            '[&::-webkit-calendar-picker-indicator]:h-full',
                            '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
                            // Для Firefox
                            '[&::-moz-calendar-picker-indicator]:opacity-0',
                            // Если значение пустое, показываем placeholder стиль
                            !value && 'text-muted-foreground/50'
                        )}
                    />
                    {/* Кастомная иконка календаря поверх нативного input */}
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
                    {/* Плейсхолдер для пустого значения */}
                    {!value && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
                            {placeholder}
                        </span>
                    )}
                </div>
            </div>
        )
    }

    // Кастомный календарь для десктопа
    return (
        <div ref={containerRef} className={cn('relative', className)}>
            {label && (
                <label className="text-sm text-muted-foreground mb-2 block">{label}</label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-full px-3 py-2 bg-card/60 border border-border rounded-xl',
                    'text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                    'transition-all placeholder:text-muted-foreground/50',
                    'flex items-center justify-between gap-2',
                    'hover:bg-card/80'
                )}
            >
                <span className={cn(
                    value ? 'text-foreground' : 'text-muted-foreground/50'
                )}>
                    {value ? formatDateForDisplay(value) : placeholder}
                </span>
                <CalendarIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 p-4"
                    >
                        {/* Заголовок календаря */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                                aria-label="Предыдущий месяц"
                            >
                                <ChevronLeft className="w-5 h-5 text-foreground" />
                            </button>
                            <div className="font-semibold text-base">
                                {MONTHS[currentMonth.month]} {currentMonth.year}
                            </div>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                                aria-label="Следующий месяц"
                            >
                                <ChevronRight className="w-5 h-5 text-foreground" />
                            </button>
                        </div>

                        {/* Дни недели */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {WEEKDAYS.map(day => (
                                <div
                                    key={day}
                                    className="text-center text-xs font-medium text-muted-foreground py-1"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Календарная сетка */}
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((date, index) => {
                                const isDisabled = isDateDisabled(date)
                                const isSelected = value &&
                                    date.toISOString().split('T')[0] === value
                                const isCurrentMonthDay = isCurrentMonth(date)
                                const isToday = date.toDateString() === new Date().toDateString()

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleDateSelect(date)}
                                        disabled={isDisabled || !isCurrentMonthDay}
                                        className={cn(
                                            'aspect-square flex items-center justify-center text-sm rounded-lg',
                                            'transition-all',
                                            !isCurrentMonthDay && 'text-muted-foreground/30',
                                            isDisabled && 'opacity-30 cursor-not-allowed',
                                            !isDisabled && isCurrentMonthDay && 'hover:bg-secondary',
                                            isSelected && 'bg-primary text-primary-foreground font-semibold',
                                            !isSelected && isToday && isCurrentMonthDay && 'bg-secondary/50 font-medium',
                                            !isSelected && !isToday && isCurrentMonthDay && 'text-foreground'
                                        )}
                                    >
                                        {date.getDate()}
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

