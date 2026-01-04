import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { RangeSlider } from '../../../components/ui'
import { SelectableTagButton } from '../../RoleSelector/components/SubRoles/components/SelectableTagButton'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import { useUserPositions } from '../../../hooks/useUserPositions'
import { useUserSpecializations } from '../../../hooks/useUserSpecializations'
import { getSpecializationLabel } from '../../../constants/labels'
import { mapEmployeeSubRolesFromApi } from '../../../utils/rolesMapper'
import { setPositions, setSpecializations, setSelectedPosition as setSelectedPositionAction } from '../../../store/catalogSlice'


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

const DEFAULT_PRICE_RANGE: [number, number] = [0, 1000]

export const AdvancedFilters = ({
    isOpen,
    onClose,
    onApply,
    initialFilters,
    filteredCount,
    onReset,
}: AdvancedFiltersProps) => {
    const dispatch = useAppDispatch()
    const positionsFromStore = useAppSelector(state => state.catalog.positions)

    const [priceRange, setPriceRange] = useState<[number, number]>(
        initialFilters?.priceRange || DEFAULT_PRICE_RANGE
    )
    const [selectedPosition, setSelectedPosition] = useState<string | null>(
        initialFilters?.selectedPosition || null
    )
    const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
        initialFilters?.selectedSpecializations || []
    )
    const [startDate, setStartDate] = useState<string | null>(
        initialFilters?.startDate || null
    )
    const [endDate, setEndDate] = useState<string | null>(
        initialFilters?.endDate || null
    )

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

    const parseDateFromDisplay = useCallback((displayValue: string): string | null => {
        if (!displayValue) return null
        const cleaned = displayValue.replace(/[^\d.]/g, '')
        const parts = cleaned.split('.').filter(Boolean)
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0')
            const month = parts[1].padStart(2, '0')
            const year = parts[2]
            const dateStr = `${year}-${month}-${day}`
            const date = new Date(dateStr)
            const isValid = !isNaN(date.getTime()) &&
                date.getFullYear() === parseInt(year) &&
                date.getMonth() + 1 === parseInt(month) &&
                date.getDate() === parseInt(day)
            if (isValid) {
                return dateStr
            }
        }
        return null
    }, [])

    // Обработчики для полей дат с маской
    const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        // Разрешаем только цифры и точки
        const cleaned = value.replace(/[^\d.]/g, '')

        // Применяем маску DD.MM.YYYY
        let masked = cleaned
        if (cleaned.length > 2 && !cleaned.includes('.', 2)) {
            masked = cleaned.slice(0, 2) + '.' + cleaned.slice(2)
        }
        if (cleaned.length > 5 && cleaned.split('.').length === 2) {
            masked = cleaned.slice(0, 5) + '.' + cleaned.slice(5, 9)
        }

        // Ограничиваем длину
        if (masked.length <= 10) {
            const parsed = parseDateFromDisplay(masked)
            if (parsed) {
                // Проверяем, что дата не в прошлом
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const selectedDate = new Date(parsed)
                selectedDate.setHours(0, 0, 0, 0)

                if (selectedDate >= today) {
                    setStartDate(parsed)
                }
            } else if (masked.length === 0) {
                setStartDate(null)
            }
        }
    }, [parseDateFromDisplay])

    const handleEndDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const cleaned = value.replace(/[^\d.]/g, '')

        let masked = cleaned
        if (cleaned.length > 2 && !cleaned.includes('.', 2)) {
            masked = cleaned.slice(0, 2) + '.' + cleaned.slice(2)
        }
        if (cleaned.length > 5 && cleaned.split('.').length === 2) {
            masked = cleaned.slice(0, 5) + '.' + cleaned.slice(5, 9)
        }

        if (masked.length <= 10) {
            const parsed = parseDateFromDisplay(masked)
            if (parsed) {
                // Проверяем, что дата не раньше startDate и не в прошлом
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const minDate = startDate ? new Date(startDate) : today
                minDate.setHours(0, 0, 0, 0)
                const selectedDate = new Date(parsed)
                selectedDate.setHours(0, 0, 0, 0)

                if (selectedDate >= minDate) {
                    setEndDate(parsed)
                }
            } else if (masked.length === 0) {
                setEndDate(null)
            }
        }
    }, [parseDateFromDisplay, startDate])

    // Загружаем позиции (используем существующий хук)
    const { positionsApi } = useUserPositions({ enabled: isOpen })

    // Сохраняем позиции в Redux после загрузки
    useEffect(() => {
        if (positionsApi && positionsApi.length > 0) {
            dispatch(setPositions(positionsApi))
        }
    }, [positionsApi, dispatch])

    // Используем позиции из Redux или из запроса, преобразуем в формат с названиями
    const positionsForDisplay = useMemo(() => {
        const positionsToUse = positionsFromStore.length > 0 ? positionsFromStore : positionsApi
        return mapEmployeeSubRolesFromApi(positionsToUse)
    }, [positionsFromStore, positionsApi])

    // Загружаем специализации при выборе позиции (используем существующий хук)
    const { specializations: availableSpecializations } = useUserSpecializations({
        position: selectedPosition,
        enabled: isOpen && !!selectedPosition, // Загружаем только если модальное окно открыто И позиция выбрана
    })

    // Сохраняем специализации в Redux после загрузки
    useEffect(() => {
        if (availableSpecializations.length > 0 && selectedPosition) {
            dispatch(setSpecializations({ position: selectedPosition, specializations: availableSpecializations }))
        }
    }, [availableSpecializations, selectedPosition, dispatch])

    // Синхронизируем внутреннее состояние с initialFilters только при открытии модального окна
    // Используем ref для отслеживания, было ли модальное окно открыто ранее
    const prevIsOpenRef = useRef(false)

    useEffect(() => {
        // Синхронизируем только при открытии модального окна (переход из закрытого в открытое)
        if (isOpen && !prevIsOpenRef.current) {
            if (initialFilters) {
                setPriceRange(initialFilters.priceRange)
                setSelectedPosition(initialFilters.selectedPosition || null)
                setSelectedSpecializations(initialFilters.selectedSpecializations || [])
                setStartDate(initialFilters.startDate || null)
                setEndDate(initialFilters.endDate || null)
                // НЕ применяем фильтры при открытии - они уже применены
            } else {
                // Сбрасываем к значениям по умолчанию, если нет initialFilters
                setPriceRange(DEFAULT_PRICE_RANGE)
                setSelectedPosition(null)
                setSelectedSpecializations([])
                setStartDate(null)
                setEndDate(null)
            }
        }

        prevIsOpenRef.current = isOpen
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]) // Синхронизируем только при открытии/закрытии модального окна

    const handlePositionSelect = useCallback((position: string) => {
        if (selectedPosition === position) {
            // Если позиция уже выбрана, снимаем выбор
            setSelectedPosition(null)
            setSelectedSpecializations([])
            dispatch(setSelectedPositionAction(null))
        } else {
            // Выбираем новую позицию
            setSelectedPosition(position)
            setSelectedSpecializations([]) // Сбрасываем специализации при смене позиции
            dispatch(setSelectedPositionAction(position))
        }
    }, [selectedPosition, dispatch])

    const toggleSpecialization = useCallback((specialization: string) => {
        setSelectedSpecializations(prev =>
            prev.includes(specialization)
                ? prev.filter(s => s !== specialization)
                : [...prev, specialization]
        )
    }, [])

    const hasActiveFilters = useMemo(() => {
        const isDefaultPriceRange =
            priceRange[0] === DEFAULT_PRICE_RANGE[0] &&
            priceRange[1] === DEFAULT_PRICE_RANGE[1]
        return !isDefaultPriceRange ||
            selectedPosition !== null || selectedSpecializations.length > 0 ||
            startDate !== null || endDate !== null
    }, [priceRange, selectedPosition, selectedSpecializations, startDate, endDate])

    // Используем filteredCount из пропсов (из основного запроса в FeedPage)
    // Не делаем отдельный preview запрос, чтобы избежать дублирования запросов
    const previewCount = filteredCount ?? 0

    const handleReset = useCallback(() => {
        setPriceRange(DEFAULT_PRICE_RANGE)
        setSelectedPosition(null)
        setSelectedSpecializations([])
        setStartDate(null)
        setEndDate(null)
        dispatch(setSelectedPositionAction(null))
        onReset?.()
    }, [onReset, dispatch])

    const handleRangeChange = useCallback((range: [number, number]) => {
        setPriceRange(range)
    }, [])

    // Автоматически применяем фильтры при изменении (только когда модальное окно открыто)
    // Используем ref для отслеживания, были ли фильтры уже применены при открытии
    const isInitialMountRef = useRef(true)
    const prevIsOpenForApplyRef = useRef(false)

    useEffect(() => {
        // При открытии модального окна сбрасываем флаг
        if (isOpen && !prevIsOpenForApplyRef.current) {
            isInitialMountRef.current = true
            prevIsOpenForApplyRef.current = true
            return
        }

        // При закрытии модального окна применяем текущие фильтры и сбрасываем флаг
        if (!isOpen && prevIsOpenForApplyRef.current) {
            // Применяем фильтры при закрытии, если пользователь что-то изменил
            const filters = {
                priceRange,
                selectedPosition,
                selectedSpecializations,
                startDate,
                endDate
            }
            onApply(filters)

            prevIsOpenForApplyRef.current = false
            isInitialMountRef.current = true
            return
        }

        // Пропускаем первое применение после открытия модального окна
        if (isOpen && isInitialMountRef.current) {
            isInitialMountRef.current = false
            return
        }

        // Применяем фильтры только при реальном изменении пользователем
        if (isOpen) {
            const timeoutId = setTimeout(() => {
                const filters = {
                    priceRange,
                    selectedPosition,
                    selectedSpecializations,
                    startDate,
                    endDate
                }
                onApply(filters)
            }, 300) // 300ms задержка для всех фильтров

            return () => clearTimeout(timeoutId)
        }
    }, [priceRange, selectedPosition, selectedSpecializations, startDate, endDate, onApply, isOpen])

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
                                    <div className="space-y-2">
                                        <label className="text-sm text-muted-foreground">От</label>
                                        <input
                                            type="text"
                                            value={formatDateForDisplay(startDate)}
                                            onChange={handleStartDateChange}
                                            placeholder="ДД.ММ.ГГГГ"
                                            maxLength={10}
                                            className="w-full px-3 py-2 bg-card/60 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-muted-foreground">До</label>
                                        <input
                                            type="text"
                                            value={formatDateForDisplay(endDate)}
                                            onChange={handleEndDateChange}
                                            placeholder="ДД.ММ.ГГГГ"
                                            maxLength={10}
                                            className="w-full px-3 py-2 bg-card/60 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                                        />
                                    </div>
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
