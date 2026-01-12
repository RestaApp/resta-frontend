import { X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { RangeSlider, DatePicker } from '@/components/ui'
import { useUserPositions } from '@/hooks/useUserPositions'
import { useUserSpecializations } from '@/hooks/useUserSpecializations'
import { getSpecializationLabel } from '@/constants/labels'
import { SelectableTagButton } from '@/pages/RoleSelector/components/SubRoles/components/SelectableTagButton'
import { useAdvancedFilters } from '../hooks/useAdvancedFilters'
import { DEFAULT_PRICE_RANGE, DEFAULT_JOBS_PRICE_RANGE } from '@/utils/filters'


export interface AdvancedFiltersData {
    priceRange: [number, number] | null
    selectedPosition?: string | null
    selectedSpecializations?: string[]
    startDate?: string | null // YYYY-MM-DD
    endDate?: string | null // YYYY-MM-DD
}

interface AdvancedFiltersProps {
    isOpen: boolean
    onClose: () => void
    onApply: (filters: AdvancedFiltersData | null) => void
    initialFilters?: AdvancedFiltersData
    filteredCount?: number
    onReset?: () => void
    searchQuery?: string
    activeFilter?: string
    isVacancy?: boolean // Флаг для вакансий (скрыть период, изменить текст)
}

export const AdvancedFilters = ({
    isOpen,
    onClose,
    onApply,
    initialFilters,
    filteredCount,
    onReset,
    isVacancy = false,
}: AdvancedFiltersProps) => {
    // Используем кастомный хук для управления логикой фильтров
    const {
        priceRange,
        selectedPosition,
        selectedSpecializations,
        startDate,
        endDate,
        setPriceRange,
        setStartDate,
        setEndDate,
        handlePositionSelect,
        toggleSpecialization,
        handleReset,
        hasActiveFilters,
    } = useAdvancedFilters({
        initialFilters: initialFilters || null,
        isOpen,
        onApply,
        onReset,
    })

    // Дефолтный диапазон для отображения (не применяется автоматически)
    const displayPriceRange = useMemo(() => {
        return priceRange || (isVacancy ? DEFAULT_JOBS_PRICE_RANGE : DEFAULT_PRICE_RANGE)
    }, [priceRange, isVacancy])

    // Сохраняем предыдущие специализации для отображения во время загрузки
    const [previousSpecializations, setPreviousSpecializations] = useState<string[]>([])
    const prevPositionRef = useRef<string | null>(null)
    const cachedSpecializationsRef = useRef<Map<string, string[]>>(new Map())

    // Получаем минимальную дату для начальной даты (сегодня)
    const getMinStartDate = useCallback((): string => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return today.toISOString().split('T')[0]
    }, [])

    // Получаем минимальную дату для конечной даты (сегодня или startDate)
    const getMinEndDate = useCallback((): string => {
        if (startDate) {
            return startDate
        }
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return today.toISOString().split('T')[0]
    }, [startDate])

    // Загружаем позиции (хук сам использует Redux кеш и сохраняет данные)
    const { positions: positionsForDisplay } = useUserPositions({ enabled: isOpen })

    // Загружаем специализации при выборе позиции (хук сам использует Redux кеш и сохраняет данные)
    const {
        specializations: availableSpecializations,
        isLoading: isLoadingSpecializations,
        isFetching: isFetchingSpecializations
    } = useUserSpecializations({
        position: selectedPosition,
        enabled: isOpen && !!selectedPosition,
    })

    // Сохраняем специализации в кеш, когда они загрузились
    useEffect(() => {
        if (!isLoadingSpecializations && !isFetchingSpecializations && availableSpecializations.length > 0 && selectedPosition) {
            cachedSpecializationsRef.current.set(selectedPosition, availableSpecializations)
        }
    }, [isLoadingSpecializations, isFetchingSpecializations, availableSpecializations, selectedPosition])

    // Сохраняем предыдущие специализации при смене позиции
    useEffect(() => {
        // Если позиция изменилась - сохраняем специализации предыдущей позиции из кеша
        if (prevPositionRef.current !== null && prevPositionRef.current !== selectedPosition) {
            const prevSpecs = cachedSpecializationsRef.current.get(prevPositionRef.current)
            if (prevSpecs && prevSpecs.length > 0) {
                setPreviousSpecializations(prevSpecs)
            }
        }

        // Обновляем ref текущей позиции
        prevPositionRef.current = selectedPosition
    }, [selectedPosition])

    // Очищаем предыдущие специализации, когда новые загрузились
    useEffect(() => {
        if (!isLoadingSpecializations && !isFetchingSpecializations && availableSpecializations.length > 0) {
            setPreviousSpecializations([])
        }
    }, [isLoadingSpecializations, isFetchingSpecializations, availableSpecializations.length])

    // Определяем, какие специализации показывать (предыдущие во время загрузки или новые)
    const isLoading = isLoadingSpecializations || isFetchingSpecializations
    const shouldShowPrevious = isLoading && previousSpecializations.length > 0
    const displaySpecializations = shouldShowPrevious ? previousSpecializations : availableSpecializations
    const isSpecializationsLoading = shouldShowPrevious

    // Используем filteredCount из пропсов (из основного запроса в FeedPage)
    const previewCount = filteredCount ?? 0

    const handleRangeChange = useCallback((range: [number, number]) => {
        setPriceRange(range)
    }, [setPriceRange])

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
                        layout
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 300,
                            layout: { duration: 0.25, ease: 'easeInOut' },
                        }}
                        className="fixed bottom-19 left-0 right-0 bg-card rounded-t-[24px] z-50 flex flex-col"
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

                        <motion.div
                            layout
                            transition={{ layout: { duration: 0.25, ease: 'easeInOut' } }}
                            className="p-5 space-y-8 pb-4 overflow-y-auto flex-1"
                        >
                            {/* 1. Бюджет (Range Slider) */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-base">
                                        {isVacancy ? 'Ставка за вакансию' : 'Ставка за смену'}
                                    </h3>
                                    <span className="text-primary font-bold text-sm">
                                        {displayPriceRange[0]} - {displayPriceRange[1]} BYN
                                    </span>
                                </div>
                                <RangeSlider
                                    min={0}
                                    max={isVacancy ? 5000 : 1000}
                                    step={isVacancy ? 50 : 10}
                                    range={displayPriceRange}
                                    onRangeChange={handleRangeChange}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>0 BYN</span>
                                    <span>{isVacancy ? '5000+' : '1000+'} BYN</span>
                                </div>
                            </div>

                            {/* 2. Даты (только для смен, не для вакансий) */}
                            {!isVacancy && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-base">Период</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <DatePicker
                                            value={startDate}
                                            onChange={setStartDate}
                                            minDate={getMinStartDate()}
                                            label="От"
                                        />
                                        <DatePicker
                                            value={endDate}
                                            onChange={setEndDate}
                                            minDate={getMinEndDate()}
                                            label="До"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* 3. Позиция */}
                            {positionsForDisplay.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-base">Позиция</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {positionsForDisplay.map((position) => {
                                            const positionValue = position.originalValue || position.id
                                            return (
                                                <SelectableTagButton
                                                    key={positionValue}
                                                    value={positionValue}
                                                    label={position.title}
                                                    isSelected={selectedPosition === positionValue}
                                                    onClick={() => handlePositionSelect(positionValue)}
                                                    ariaLabel={`Выбрать позицию: ${position.title}`}
                                                />
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 4. Специализация (показываем только если выбрана позиция) */}
                            <AnimatePresence initial={false}>
                                {selectedPosition && (displaySpecializations.length > 0 || isSpecializationsLoading) && (
                                    <motion.div
                                        key={`specializations-${selectedPosition}`}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        layout
                                        className="space-y-3 overflow-hidden relative"
                                    >
                                        <h3 className="font-semibold text-base">Специализация</h3>
                                        <div className="flex flex-wrap gap-2 relative">
                                            {/* Индикатор загрузки на фоне */}
                                            {isSpecializationsLoading && (
                                                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                                                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                                </div>
                                            )}

                                            {displaySpecializations.map((specialization) => (
                                                <SelectableTagButton
                                                    key={specialization}
                                                    value={specialization}
                                                    label={getSpecializationLabel(specialization)}
                                                    isSelected={selectedSpecializations.includes(specialization)}
                                                    onClick={() => toggleSpecialization(specialization)}
                                                    ariaLabel={`Выбрать специализацию: ${getSpecializationLabel(specialization)}`}
                                                    disabled={isSpecializationsLoading}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </motion.div>

                        {/* Информация о количестве найденных смен/вакансий */}
                        {previewCount !== undefined && (
                            <div className="px-5 py-4 text-center text-sm text-muted-foreground border-t border-border/50 bg-card/50">
                                Найдено {isVacancy ? 'вакансий' : 'смен'}: <span className="font-semibold text-foreground">{previewCount}</span>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
