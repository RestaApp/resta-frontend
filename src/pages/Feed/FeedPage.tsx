import { useMemo, useCallback } from 'react'
import { motion } from 'motion/react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useToast } from '@/hooks/useToast'
import { Tabs } from '@/components/ui/tabs'
import { formatFiltersForDisplay, hasActiveFilters } from '@/utils/filters'
import { Toast } from '@/components/ui/toast'
import type { FeedType } from './types'
import type { TabOption } from '@/components/ui/tabs'
import { SearchFilters } from './components/SearchFilters'
import { HotOffers, type HotOffer } from './components/HotOffers'
import { ShiftCard } from './components/ShiftCard'
import { EmptyState } from './components/EmptyState'
import { ShiftSkeleton } from '@/components/ui/ShiftSkeleton'
import { ShiftDetailsScreen } from './components/ShiftDetailsScreen'
import { AdvancedFilters, type AdvancedFiltersData } from './components/AdvancedFilters'
import { InfiniteScrollTrigger } from './components/InfiniteScrollTrigger'
import { useFeedFiltersState } from './hooks/useFeedFiltersState'
import { useVacanciesInfiniteList } from './hooks/useVacanciesInfiniteList'
import { buildVacanciesBaseParams } from './utils/queryParams'
import { applyClientQuickFilters } from './utils/clientFilters'
import { useHaptics } from '@/utils/haptics'
import { useHotOffers } from './hooks/useHotOffers'
import { useShiftActions } from './hooks/useShiftActions'
import { mapVacancyToShift } from './utils/mapping'
import { syncFiltersPositionAndSpecializations } from './utils/filterSync'

export const FeedPage = () => {
    useUserProfile()
    const { toast, hideToast } = useToast()
    const haptics = useHaptics()

    // Управление состоянием фида
    const {
        feedType,
        setFeedType,
        quickFilter,
        setQuickFilter,
        advancedFilters,
        setAdvancedFilters,
        shiftsAdvancedFilters,
        jobsAdvancedFilters,
        setShiftsAdvancedFilters,
        setJobsAdvancedFilters,
        selectedShiftId,
        setSelectedShiftId,
        isFiltersOpen,
        setIsFiltersOpen,
        resetFilters: resetFeedFilters,
        userPosition,
    } = useFeedFiltersState()

    const {
        appliedShiftsSet,
        handleApply,
        handleCancel,
        isShiftLoading,
    } = useShiftActions()

    // Базовые параметры для смен (используем фильтры смен напрямую)
    const shiftsBaseQuery = useMemo(
        () => buildVacanciesBaseParams({
            activeQuickFilter: quickFilter,
            advanced: shiftsAdvancedFilters,
            shiftType: 'replacement'
        }),
        [quickFilter, shiftsAdvancedFilters]
    )

    // Базовые параметры для вакансий (используем фильтры вакансий напрямую, без дат)
    const jobsBaseQuery = useMemo(
        () => buildVacanciesBaseParams({
            activeQuickFilter: quickFilter,
            advanced: jobsAdvancedFilters,
            shiftType: 'vacancy'
        }),
        [quickFilter, jobsAdvancedFilters]
    )

    // Бесконечная загрузка смен
    const shiftsList = useVacanciesInfiniteList({
        shiftType: 'replacement',
        baseQuery: shiftsBaseQuery,
        enabled: feedType === 'shifts',
        perPage: 5,
    })

    // Бесконечная загрузка вакансий
    const jobsList = useVacanciesInfiniteList({
        shiftType: 'vacancy',
        baseQuery: jobsBaseQuery,
        enabled: feedType === 'jobs',
        perPage: 5,
    })

    const { addVacanciesToMap: addShiftsVacanciesToMap } = shiftsList

    // Выбираем активный список в зависимости от типа фида
    const activeList = feedType === 'shifts' ? shiftsList : jobsList

    const {
        hotOffers,
        hotVacancies,
        hotOffersTotalCount,
    } = useHotOffers({
        feedType,
        advancedFilters: feedType === 'shifts' ? shiftsAdvancedFilters : jobsAdvancedFilters,
        addVacanciesToMap: addShiftsVacanciesToMap,
    })

    // Применяем клиентские фильтры
    const filteredShifts = useMemo(() => {
        return applyClientQuickFilters({
            shifts: activeList.items,
            quickFilter,
            userPosition,
        })
    }, [activeList.items, quickFilter, userPosition])

    const handleOpenShiftDetails = useCallback((shiftId: number) => {
        setSelectedShiftId(shiftId)
    }, [setSelectedShiftId])

    const handleCloseShiftDetails = useCallback(() => {
        setSelectedShiftId(null)
    }, [setSelectedShiftId])

    const handleHotOfferClick = useCallback((item: HotOffer) => {
        haptics.trigger('light')
        const shift = filteredShifts.find(s => s.id === item.id)
        if (shift) {
            handleOpenShiftDetails(shift.id)
            return
        }
        const vacancyFromMap = activeList.vacanciesMap.get(item.id)
        if (vacancyFromMap) {
            handleOpenShiftDetails(item.id)
            return
        }
        const vacancyFromHot = hotVacancies.find(vacancy => vacancy.id === item.id)
        if (vacancyFromHot) {
            addShiftsVacanciesToMap([vacancyFromHot])
            handleOpenShiftDetails(item.id)
            return
        }
        const foundShift = filteredShifts.find(s => {
            const shiftName = s.restaurant.toLowerCase()
            const itemName = item.restaurant.toLowerCase()
            return shiftName.includes(itemName) || itemName.includes(shiftName)
        })
        if (foundShift) {
            handleOpenShiftDetails(foundShift.id)
        }
    }, [
        haptics,
        filteredShifts,
        activeList.vacanciesMap,
        hotVacancies,
        addShiftsVacanciesToMap,
        handleOpenShiftDetails,
    ])

    const handleShowAllHotShifts = useCallback(() => {
        setQuickFilter('urgent')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [setQuickFilter])

    const handleResetFilters = useCallback(() => {
        resetFeedFilters()
    }, [resetFeedFilters])

    const handleApplyAdvancedFilters = useCallback((filters: AdvancedFiltersData | null) => {
        // Обновляем фильтры для текущего типа фида
        setAdvancedFilters(filters)

        // Синхронизируем позиции и специализации с другим типом фида
        if (filters) {
            if (feedType === 'shifts') {
                const syncedFilters = syncFiltersPositionAndSpecializations(filters, jobsAdvancedFilters)
                setJobsAdvancedFilters(syncedFilters)
            } else {
                const syncedFilters = syncFiltersPositionAndSpecializations(filters, shiftsAdvancedFilters)
                setShiftsAdvancedFilters(syncedFilters)
            }
        }
    }, [setAdvancedFilters, feedType, shiftsAdvancedFilters, jobsAdvancedFilters, setShiftsAdvancedFilters, setJobsAdvancedFilters])

    // Определяем, есть ли активные фильтры
    const activeFiltersList = useMemo(() => {
        return formatFiltersForDisplay(advancedFilters)
    }, [advancedFilters])

    const hasActiveAdvancedFilters = useMemo(() => {
        const hasActiveQuickFilter = quickFilter !== 'all'
        const hasAdvancedFilters = advancedFilters ? hasActiveFilters(advancedFilters) : false
        return hasActiveQuickFilter || hasAdvancedFilters
    }, [advancedFilters, quickFilter])

    // Количество отфильтрованных смен или вакансий
    const filteredCount = useMemo(() => {
        // В UI не хотим показывать -1, это служебное значение "еще не знаем"
        return activeList.totalCount < 0 ? 0 : activeList.totalCount
    }, [activeList.totalCount])

    const selectedVacancy = useMemo(() => {
        if (!selectedShiftId) return null
        return activeList.vacanciesMap.get(selectedShiftId) || null
    }, [selectedShiftId, activeList.vacanciesMap])

    const selectedShift = useMemo(() => {
        if (!selectedShiftId) return null
        const shiftFromList = filteredShifts.find(s => s.id === selectedShiftId)
        if (shiftFromList) {
            return shiftFromList
        }
        return selectedVacancy ? mapVacancyToShift(selectedVacancy) : null
    }, [selectedShiftId, filteredShifts, selectedVacancy])

    const feedTypeOptions: TabOption<FeedType>[] = [
        { id: 'shifts', label: '🔥 Смены' },
        { id: 'jobs', label: '💼 Вакансии' },
    ]

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="top-0 z-10 bg-background/95 backdrop-blur-sm pt-2 transition-all border-border/50">
                <div className="px-4 pb-2">
                    <Tabs options={feedTypeOptions} activeId={feedType} onChange={setFeedType} />
                </div>
                <SearchFilters
                    onOpenFilters={() => setIsFiltersOpen(true)}
                    isLoading={activeList.isFetching}
                    hasActiveFilters={hasActiveAdvancedFilters}
                    activeFiltersList={activeFiltersList}
                />
            </div>

            {feedType === 'shifts' && hotOffers.length > 0 && (
                <HotOffers
                    items={hotOffers}
                    totalCount={hotOffersTotalCount}
                    onShowAll={hotOffersTotalCount && hotOffers.length < hotOffersTotalCount ? handleShowAllHotShifts : undefined}
                    onItemClick={handleHotOfferClick}
                />
            )}

            <div className="px-4 py-4 space-y-4">
                {activeList.isInitialLoading ? (
                    <ShiftSkeleton />
                ) : activeList.error ? (
                    <div className="text-center py-8 text-destructive">
                        Ошибка загрузки {feedType === 'shifts' ? 'смен' : 'вакансий'}
                    </div>
                ) : filteredShifts.length === 0 && (activeList.totalCount === 0 || (!activeList.isFetching && activeList.totalCount !== -1)) ? (
                    <EmptyState
                        message={quickFilter !== 'all' || advancedFilters
                            ? 'По вашим фильтрам ничего не найдено'
                            : feedType === 'shifts' ? 'Смены не найдены' : 'Вакансии не найдены'}
                        onReset={handleResetFilters}
                        showResetButton={!!(quickFilter !== 'all' || advancedFilters)}
                    />
                ) : filteredShifts.length === 0 && activeList.isFetching ? (
                    <ShiftSkeleton />
                ) : (
                    <>
                        {filteredShifts.map((shift, index) => (
                            <motion.div
                                key={shift.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                            >
                                <ShiftCard
                                    shift={shift}
                                    isApplied={appliedShiftsSet.has(shift.id)}
                                    onOpenDetails={handleOpenShiftDetails}
                                    onApply={handleApply}
                                    onCancel={handleCancel}
                                    isLoading={isShiftLoading(shift.id)}
                                    isVacancy={feedType === 'jobs'}
                                />
                            </motion.div>
                        ))}
                        {filteredShifts.length > 0 && (
                            <InfiniteScrollTrigger
                                onLoadMore={activeList.loadMore}
                                hasMore={activeList.hasMore}
                                isLoading={activeList.isFetching}
                                isError={!!activeList.error}
                            />
                        )}
                    </>
                )}
            </div>

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />

            {/* Детальная карточка смены или вакансии */}
            {selectedShiftId && (
                <ShiftDetailsScreen
                    shift={selectedShift}
                    vacancyData={selectedVacancy}
                    isOpen={!!selectedShiftId}
                    onClose={handleCloseShiftDetails}
                    onApply={handleApply}
                    onCancel={handleCancel}
                    isApplied={appliedShiftsSet.has(selectedShiftId)}
                    isLoading={isShiftLoading(selectedShiftId)}
                    isVacancy={feedType === 'jobs'}
                />
            )}

            {/* Расширенные фильтры */}
            <AdvancedFilters
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
                onApply={handleApplyAdvancedFilters}
                initialFilters={advancedFilters || undefined}
                filteredCount={filteredCount}
                onReset={resetFeedFilters}
                isVacancy={feedType === 'jobs'}
            />
        </div>
    )
}
