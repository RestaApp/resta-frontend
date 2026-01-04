import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useCallback } from 'react'
import { RangeSlider, DatePicker } from '@/components/ui'
import { useUserPositions } from '@/hooks/useUserPositions'
import { useUserSpecializations } from '@/hooks/useUserSpecializations'
import { getSpecializationLabel } from '@/constants/labels'
import { SelectableTagButton } from '@/pages/RoleSelector/components/SubRoles/components/SelectableTagButton'
import { useAdvancedFilters } from '../hooks/useAdvancedFilters'


export interface AdvancedFiltersData {
    priceRange: [number, number]
    selectedPosition?: string | null
    selectedSpecializations?: string[]
    startDate?: string | null // YYYY-MM-DD
    endDate?: string | null // YYYY-MM-DD
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

export const AdvancedFilters = ({
    isOpen,
    onClose,
    onApply,
    initialFilters,
    filteredCount,
    onReset,
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
    const { specializations: availableSpecializations } = useUserSpecializations({
        position: selectedPosition,
        enabled: isOpen && !!selectedPosition,
    })

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
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-15 left-0 right-0 bg-card rounded-t-[24px] z-50 max-h-[90vh] flex flex-col"
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

                            {/* 2. Даты */}
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
                            <AnimatePresence>
                                {selectedPosition && availableSpecializations.length > 0 && (
                                    <motion.div
                                        key={`specializations-${selectedPosition}`}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        layout
                                        className="space-y-3 overflow-hidden"
                                    >
                                        <h3 className="font-semibold text-base">Специализация</h3>
                                        <motion.div
                                            layout
                                            className="flex flex-wrap gap-2"
                                            transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
                                        >
                                            <AnimatePresence mode="popLayout">
                                                {availableSpecializations.map((specialization) => (
                                                    <motion.div
                                                        key={specialization}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <SelectableTagButton
                                                            value={specialization}
                                                            label={getSpecializationLabel(specialization)}
                                                            isSelected={selectedSpecializations.includes(specialization)}
                                                            onClick={() => toggleSpecialization(specialization)}
                                                            ariaLabel={`Выбрать специализацию: ${getSpecializationLabel(specialization)}`}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>

                        {/* Информация о количестве найденных смен */}
                        {previewCount !== undefined && (
                            <div className="px-5 py-4 text-center text-sm text-muted-foreground border-t border-border/50 bg-card/50">
                                Найдено смен: <span className="font-semibold text-foreground">{previewCount}</span>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
