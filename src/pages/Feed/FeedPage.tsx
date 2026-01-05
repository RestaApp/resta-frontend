import { useMemo, useCallback, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useToast } from '@/hooks/useToast'
import { Tabs } from '@/components/ui/tabs'
import { useGetVacanciesQuery } from '@/services/api/shiftsApi'
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
import { useShiftApplication } from './hooks/useShiftApplication'
import { mapVacancyToShift } from './utils/mapping'
import { useFeedFiltersState } from './hooks/useFeedFiltersState'
import { useVacanciesInfiniteList } from './hooks/useVacanciesInfiniteList'
import { buildVacanciesBaseParams, buildVacanciesQueryParams } from './utils/queryParams'
import { applyClientQuickFilters } from './utils/clientFilters'
import { useAppliedShifts } from './hooks/useAppliedShifts'
import { useHaptics } from '@/utils/haptics'

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
        selectedShiftId,
        setSelectedShiftId,
        isFiltersOpen,
        setIsFiltersOpen,
        resetFilters: resetFeedFilters,
        userPosition,
    } = useFeedFiltersState()

    const {
        appliedShifts,
        appliedShiftsSet,
        markApplied,
        unmarkApplied,
    } = useAppliedShifts()

    const baseQuery = useMemo(
        () => buildVacanciesBaseParams({ activeQuickFilter: quickFilter, advanced: advancedFilters }),
        [quickFilter, advancedFilters]
    )

    // Бесконечная загрузка смен
    const shiftsList = useVacanciesInfiniteList({
        shiftType: 'replacement',
        baseQuery,
        enabled: feedType === 'shifts',
        perPage: 5,
    })

    // Бесконечная загрузка вакансий
    const jobsList = useVacanciesInfiniteList({
        shiftType: 'vacancy',
        baseQuery,
        enabled: feedType === 'jobs',
        perPage: 5,
    })

    const { addVacanciesToMap: addShiftsVacanciesToMap } = shiftsList

    // Выбираем активный список в зависимости от типа фида
    const activeList = feedType === 'shifts' ? shiftsList : jobsList

    // Параметры для запроса горящих смен
    const hotShiftsQueryParams = useMemo(() => {
        return buildVacanciesQueryParams({
            shiftType: 'replacement',
            page: 1,
            perPage: 4,
            urgent: true,
            advanced: advancedFilters,
        })
    }, [advancedFilters])

    // Загрузка горящих смен
    const { data: hotShiftsResponse } = useGetVacanciesQuery(hotShiftsQueryParams, {
        refetchOnMountOrArgChange: false,
        skip: feedType !== 'shifts',
    })

    // Сохраняем данные из hotShiftsResponse в vacanciesMap для доступа к детальной информации
    useEffect(() => {
        if (hotShiftsResponse?.data && hotShiftsResponse.data.length > 0 && feedType === 'shifts') {
            // Добавляем только в vacanciesMap для доступа к детальной информации
            addShiftsVacanciesToMap(hotShiftsResponse.data)
        }
    }, [hotShiftsResponse, feedType, addShiftsVacanciesToMap])

    // Получаем горящие смены из отдельного запроса
    const actualHotShifts = useMemo(() => {
        if (hotShiftsResponse?.data && hotShiftsResponse.data.length > 0) {
            return hotShiftsResponse.data.slice(0, 4).map(vacancy => {
                const shift = mapVacancyToShift(vacancy)
                const payment = typeof shift.pay === 'number' && !isNaN(shift.pay) ? shift.pay : 0
                return {
                    id: shift.id,
                    emoji: shift.logo,
                    payment,
                    time: shift.date,
                    restaurant: shift.restaurant,
                    position: vacancy.position || shift.position || 'Сотрудник',
                    specialization: vacancy.specialization || null,
                }
            })
        }
        return []
    }, [hotShiftsResponse])

    // Получаем общее количество горящих смен
    const hotShiftsTotalCount = useMemo(() => {
        const pagination = hotShiftsResponse?.pagination || hotShiftsResponse?.meta
        return pagination?.total_count ?? undefined
    }, [hotShiftsResponse])

    // Применяем клиентские фильтры
    const filteredShifts = useMemo(() => {
        return applyClientQuickFilters({
            shifts: activeList.items,
            quickFilter,
            userPosition,
        })
    }, [activeList.items, quickFilter, userPosition])

    // Хук для работы с заявками
    const { apply, cancel } = useShiftApplication({
        onSuccess: () => {
            // Не закрываем детальный экран при отклике с карточки
        },
    })

    const [loadingShiftId, setLoadingShiftId] = useState<number | null>(null)

    const handleApply = useCallback(
        async (shiftId: number) => {
            setLoadingShiftId(shiftId)
            try {
                await apply(shiftId)
                markApplied(shiftId)
            } catch {
                // Ошибка уже обработана в хуке
            } finally {
                setLoadingShiftId(null)
            }
        },
        [apply, markApplied]
    )

    const handleCancel = useCallback(
        async (shiftId: number) => {
            setLoadingShiftId(shiftId)
            try {
                await cancel(shiftId)
                unmarkApplied(shiftId)
            } catch {
                // Ошибка уже обработана в хуке
            } finally {
                setLoadingShiftId(null)
            }
        },
        [cancel, unmarkApplied]
    )

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
        const vacancyFromHot = hotShiftsResponse?.data?.find(vacancy => vacancy.id === item.id)
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
        hotShiftsResponse,
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
        setAdvancedFilters(filters)
    }, [setAdvancedFilters])

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
        return activeList.totalCount
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

            {feedType === 'shifts' && actualHotShifts.length > 0 && (
                <HotOffers
                    items={actualHotShifts}
                    totalCount={hotShiftsTotalCount}
                    onShowAll={hotShiftsTotalCount && actualHotShifts.length < hotShiftsTotalCount ? handleShowAllHotShifts : undefined}
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
                ) : filteredShifts.length === 0 ? (
                    <EmptyState
                        message={quickFilter !== 'all' || advancedFilters
                            ? 'По вашим фильтрам ничего не найдено'
                            : feedType === 'shifts' ? 'Смены не найдены' : 'Вакансии не найдены'}
                        onReset={handleResetFilters}
                        showResetButton={!!(quickFilter !== 'all' || advancedFilters)}
                    />
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
                                    isLoading={loadingShiftId === shift.id}
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
                    isApplied={appliedShifts.includes(selectedShiftId)}
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
                onReset={() => {
                    setQuickFilter('all')
                    setSelectedShiftId(null)
                }}
            />
        </div>
    )
}
