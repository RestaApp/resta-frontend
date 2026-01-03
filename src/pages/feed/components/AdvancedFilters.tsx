import { X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useCallback, useMemo } from 'react'
import { RangeSlider } from '../../../components/ui'
import { SelectableTagButton } from '../../RoleSelector/components/SubRoles/components/SelectableTagButton'
import { useGetVacanciesQuery } from '../../../services/api/shiftsApi'


export interface AdvancedFiltersData {
    priceRange: [number, number]
    selectedRoles: string[]
    timeOfDay: string[]
}

interface AdvancedFiltersProps {
    isOpen: boolean
    onClose: () => void
    onApply: (filters: AdvancedFiltersData) => void
    initialFilters?: AdvancedFiltersData
    filteredCount?: number
    onReset?: () => void
    searchQuery?: string
    activeFilter?: string
}

const ROLES = ['Повар', 'Су-шеф', 'Бармен', 'Официант', 'Бариста', 'Мойщик', 'Админ']

const TIMES = [
    { id: 'morning', label: '🌅 Утро', desc: 'до 12:00' },
    { id: 'day', label: '☀️ День', desc: '12:00 - 18:00' },
    { id: 'evening', label: '🌆 Вечер', desc: 'после 18:00' },
    { id: 'night', label: '🌙 Ночь', desc: 'смены в ночь' },
]

const DEFAULT_PRICE_RANGE: [number, number] = [0, 1000]

export const AdvancedFilters = ({
    isOpen,
    onClose,
    onApply,
    initialFilters,
    filteredCount,
    onReset,
    searchQuery = '',
    activeFilter = 'all',
}: AdvancedFiltersProps) => {
    const [priceRange, setPriceRange] = useState<[number, number]>(
        initialFilters?.priceRange || DEFAULT_PRICE_RANGE
    )
    const [selectedRoles, setSelectedRoles] = useState<string[]>(
        initialFilters?.selectedRoles || []
    )
    const [timeOfDay, setTimeOfDay] = useState<string[]>(initialFilters?.timeOfDay || [])

    const toggleRole = useCallback((role: string) => {
        setSelectedRoles(prev => (prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]))
    }, [])

    const toggleTime = useCallback((time: string) => {
        setTimeOfDay(prev => (prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]))
    }, [])

    const hasActiveFilters = useMemo(() => {
        const isDefaultPriceRange =
            priceRange[0] === DEFAULT_PRICE_RANGE[0] &&
            priceRange[1] === DEFAULT_PRICE_RANGE[1]
        return !isDefaultPriceRange || selectedRoles.length > 0 || timeOfDay.length > 0
    }, [priceRange, selectedRoles, timeOfDay])

    // Формируем параметры для preview запроса
    const previewParams = useMemo(() => {
        const roleMapping: Record<string, string> = {
            'Повар': 'chef',
            'Су-шеф': 'chef',
            'Бармен': 'bartender',
            'Официант': 'waiter',
            'Бариста': 'barista',
            'Мойщик': 'support',
            'Админ': 'manager',
        }

        const params: Parameters<typeof useGetVacanciesQuery>[0] = {
            shift_type: 'replacement',
            page: 1,
            per_page: 1, // Нам нужен только total_count
        }

        // Поиск по тексту (используем текущее значение из пропсов)
        if (searchQuery) {
            params.search = searchQuery
        }

        // Быстрые фильтры
        if (activeFilter === 'urgent') {
            params.urgent = true
        }

        // Расширенные фильтры
        if (priceRange[0] !== 0 || priceRange[1] !== 1000) {
            params.min_payment = priceRange[0]
            params.max_payment = priceRange[1]
        }

        if (selectedRoles.length > 0) {
            params.target_roles = selectedRoles
                .map(role => roleMapping[role] || role.toLowerCase())
                .filter(Boolean)
        }

        if (timeOfDay.length > 0) {
            params.time_of_day = timeOfDay
        }

        return params
    }, [priceRange, selectedRoles, timeOfDay, searchQuery, activeFilter])

    // Запрос для preview количества смен
    const { data: previewResponse } = useGetVacanciesQuery(previewParams, {
        skip: !isOpen, // Запрашиваем только когда модалка открыта
    })

    // Подсчет количества смен с учетом текущих фильтров в модалке
    const previewCount = useMemo(() => {
        if (previewResponse) {
            const pagination = previewResponse.pagination || previewResponse.meta
            return pagination?.total_count ?? 0
        }
        return filteredCount ?? 0
    }, [previewResponse, filteredCount])

    const handleReset = useCallback(() => {
        setPriceRange(DEFAULT_PRICE_RANGE)
        setSelectedRoles([])
        setTimeOfDay([])
        onReset?.()
    }, [onReset])

    const handleApply = useCallback(() => {
        onApply({ priceRange, selectedRoles, timeOfDay })
        onClose()
    }, [priceRange, selectedRoles, timeOfDay, onApply, onClose])

    const handleRangeChange = useCallback((range: [number, number]) => {
        setPriceRange(range)
    }, [])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[24px] z-50 max-h-[90vh] flex flex-col"
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-muted rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-5 py-3 flex items-center justify-between border-b border-border/50">
                            <h2 className="text-xl font-bold">Фильтры</h2>
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleReset}
                                        className="px-3 py-1.5 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                                        aria-label="Сбросить фильтры"
                                    >
                                        Сбросить
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Закрыть"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-5 space-y-8 pb-4 overflow-y-auto flex-1">
                            {/* 1. Бюджет (Range Slider) */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-base">Ставка за смену</h3>
                                    <span className="text-primary font-bold text-sm">
                                        {priceRange[0]} - {priceRange[1]} BYN
                                    </span>
                                </div>
                                <RangeSlider
                                    min={0}
                                    max={1000}
                                    step={10}
                                    range={priceRange}
                                    onRangeChange={handleRangeChange}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>0 BYN</span>
                                    <span>1000+ BYN</span>
                                </div>
                            </div>

                            {/* 2. Время суток (Grid) */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-base">Время начала</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {TIMES.map((time) => {
                                        const isSelected = timeOfDay.includes(time.id)
                                        return (
                                            <button
                                                key={time.id}
                                                onClick={() => toggleTime(time.id)}
                                                className={`
                                                    flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                                                    ${isSelected
                                                        ? 'border-primary bg-primary/5 shadow-sm'
                                                        : 'border-border bg-secondary/30'
                                                    }
                                                `}
                                            >
                                                <div
                                                    className={`
                                                    w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0
                                                    ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'}
                                                `}
                                                >
                                                    {isSelected && <Check size={12} className="text-white" />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">{time.label}</div>
                                                    <div className="text-[10px] text-muted-foreground">{time.desc}</div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 3. Специализация (Tags) */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-base">Специализация</h3>
                                <div className="flex flex-wrap gap-2">
                                    {ROLES.map((role) => (
                                        <SelectableTagButton
                                            key={role}
                                            value={role}
                                            label={role}
                                            isSelected={selectedRoles.includes(role)}
                                            onClick={toggleRole}
                                            ariaLabel={`Выбрать специализацию: ${role}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Информация о количестве найденных смен - над кнопками */}
                        {previewCount !== undefined && (
                            <div className="px-5 py-2 text-center text-sm text-muted-foreground border-b border-border/50 bg-card/50">
                                Найдено смен: <span className="font-semibold text-foreground">{previewCount}</span>
                            </div>
                        )}

                        {/* Sticky Footer Buttons */}
                        <div className="p-4 bg-card border-t border-border/50 safe-area-bottom shadow-lg flex-shrink-0">
                            <button
                                onClick={handleApply}
                                className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all"
                            >
                                Применить
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

