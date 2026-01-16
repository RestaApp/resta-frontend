import { useMemo, useCallback, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useToast } from '@/hooks/useToast'
import { Tabs } from '@/components/ui/tabs'
import { Toast } from '@/components/ui/toast'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from '@/components/ui'
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
import { formatFiltersForDisplay, hasActiveFilters } from '@/utils/filters'
import { syncFiltersPositionAndSpecializations } from './utils/filterSync'
import type { FeedType } from './types'
import type { TabOption } from '@/components/ui/tabs'
import type { Shift } from './types'
import { vacancyToShift } from '../Feed/utils/mapping'
import { getLocalStorageItem, removeLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { setLocalStorageItem } from '@/utils/localStorage'

const FEED_TYPE_OPTIONS: TabOption<FeedType>[] = [
    { id: 'jobs', label: '💼 Вакансии' },
    { id: 'shifts', label: '🔥 Смены' },
]

export const FeedPage = () => {
    useUserProfile()
    const { toast, hideToast } = useToast()
    const haptics = useHaptics()

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

    // Проверка флага для переключения на вкладку смен
    useEffect(() => {
        const shouldShowShifts = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_FEED_SHIFTS)
        if (shouldShowShifts === 'true' && feedType !== 'shifts') {
            setFeedType('shifts')
            removeLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_FEED_SHIFTS)
        }
    }, [feedType, setFeedType])

    const { appliedShiftsSet, appliedApplicationsMap, getApplicationId, handleApply, handleCancel, isShiftLoading } =
        useShiftActions()

    const [alertOpen, setAlertOpen] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [, setAlertMissingFields] = useState<string[]>([])

    const handleApplyWithModal = useCallback(
        async (shiftId: number) => {
            try {
                await handleApply(shiftId)
            } catch (error: any) {
                const data = error && typeof error === 'object' && 'data' in error ? error.data : null
                if (data?.message === 'profile_incomplete') {
                    const missing: string[] = Array.isArray(data.missing_fields) ? data.missing_fields : []
                    setAlertMissingFields(missing)
                    setAlertMessage(
                        `Профиль неполный: отсутствуют поля — ${missing.length ? missing.join(', ') : 'неизвестные поля'}. Пожалуйста, заполните профиль в настройках.`
                    )
                    setAlertOpen(true)
                } else {
                    // на остальные ошибки уже показывается toast в хуке; на всякий случай покажем модал
                    setAlertMessage('Не удалось отправить заявку. Попробуйте позже.')
                    setAlertMissingFields([])
                    setAlertOpen(true)
                }
            }
        },
        [handleApply]
    )

    const shiftsBaseQuery = useMemo(
        () => buildVacanciesBaseParams({ activeQuickFilter: quickFilter, advanced: shiftsAdvancedFilters, shiftType: 'replacement' }),
        [quickFilter, shiftsAdvancedFilters]
    )

    const jobsBaseQuery = useMemo(
        () => buildVacanciesBaseParams({ activeQuickFilter: quickFilter, advanced: jobsAdvancedFilters, shiftType: 'vacancy' }),
        [quickFilter, jobsAdvancedFilters]
    )

    const shiftsList = useVacanciesInfiniteList({
        shiftType: 'replacement',
        baseQuery: shiftsBaseQuery,
        enabled: feedType === 'shifts',
        perPage: 5,
    })

    const jobsList = useVacanciesInfiniteList({
        shiftType: 'vacancy',
        baseQuery: jobsBaseQuery,
        enabled: feedType === 'jobs',
        perPage: 5,
    })

    const activeList = feedType === 'shifts' ? shiftsList : jobsList

    const { hotOffers, hotVacancies, hotOffersTotalCount } = useHotOffers({
        feedType,
        advancedFilters: feedType === 'shifts' ? shiftsAdvancedFilters : jobsAdvancedFilters,
        addVacanciesToMap: shiftsList.addVacanciesToMap,
    })

    // items уже Shift[]
    const filteredShifts = useMemo(() => {
        return applyClientQuickFilters({ shifts: activeList.items, quickFilter, userPosition })
    }, [activeList.items, quickFilter, userPosition])

    const shiftsById = useMemo(() => {
        const m = new Map<number, Shift>()
        for (const s of filteredShifts) m.set(s.id, s)
        return m
    }, [filteredShifts])

    const handleOpenShiftDetails = useCallback((id: number) => setSelectedShiftId(id), [setSelectedShiftId])
    const handleCloseShiftDetails = useCallback(() => setSelectedShiftId(null), [setSelectedShiftId])

    const handleHotOfferClick = useCallback(
        (item: HotOffer) => {
            haptics.trigger('light')

            if (shiftsById.has(item.id)) {
                handleOpenShiftDetails(item.id)
                return
            }

            const fromMap = activeList.vacanciesMap.get(item.id)
            if (fromMap) {
                handleOpenShiftDetails(item.id)
                return
            }

            const fromHot = hotVacancies.find(v => v.id === item.id)
            if (fromHot) {
                shiftsList.addVacanciesToMap([fromHot])
                handleOpenShiftDetails(item.id)
            }
        },
        [haptics, shiftsById, activeList.vacanciesMap, hotVacancies, shiftsList, handleOpenShiftDetails]
    )

    const handleShowAllHotShifts = useCallback(() => {
        setQuickFilter('urgent')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [setQuickFilter])

    const handleResetFilters = useCallback(() => resetFeedFilters(), [resetFeedFilters])

    const handleApplyAdvancedFilters = useCallback(
        (filters: AdvancedFiltersData | null) => {
            setAdvancedFilters(filters)
            if (!filters) return

            if (feedType === 'shifts') {
                setJobsAdvancedFilters(syncFiltersPositionAndSpecializations(filters, jobsAdvancedFilters))
            } else {
                setShiftsAdvancedFilters(syncFiltersPositionAndSpecializations(filters, shiftsAdvancedFilters))
            }
        },
        [setAdvancedFilters, feedType, jobsAdvancedFilters, shiftsAdvancedFilters, setJobsAdvancedFilters, setShiftsAdvancedFilters]
    )

    const activeFiltersList = useMemo(() => formatFiltersForDisplay(advancedFilters), [advancedFilters])

    const hasActiveAdvancedFilters = useMemo(() => {
        const hasQuick = quickFilter !== 'all'
        const hasAdv = advancedFilters ? hasActiveFilters(advancedFilters) : false
        return hasQuick || hasAdv
    }, [advancedFilters, quickFilter])

    const filteredCount = useMemo(() => (activeList.totalCount < 0 ? 0 : activeList.totalCount), [activeList.totalCount])

    const selectedVacancy = useMemo(() => {
        if (!selectedShiftId) return null
        return activeList.vacanciesMap.get(selectedShiftId) || null
    }, [selectedShiftId, activeList.vacanciesMap])

    const selectedShift = useMemo(() => {
        if (!selectedShiftId) return null
        const fromList = shiftsById.get(selectedShiftId)
        if (fromList) return fromList
        if (selectedVacancy) return vacancyToShift(selectedVacancy)
        return null
    }, [selectedShiftId, shiftsById, selectedVacancy])

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="top-0 z-10 bg-background/95 backdrop-blur-sm pt-2 transition-all border-border/50">
                <div className="px-4 pb-2">
                    <Tabs options={FEED_TYPE_OPTIONS} activeId={feedType} onChange={setFeedType} />
                </div>

                <SearchFilters
                    onOpenFilters={() => setIsFiltersOpen(true)}
                    isLoading={activeList.isFetching}
                    hasActiveFilters={hasActiveAdvancedFilters}
                    activeFiltersList={activeFiltersList}
                />
            </div>

            {feedType === 'shifts' && hotOffers.length > 0 ? (
                <HotOffers
                    items={hotOffers}
                    totalCount={hotOffersTotalCount}
                    onShowAll={hotOffersTotalCount && hotOffers.length < hotOffersTotalCount ? handleShowAllHotShifts : undefined}
                    onItemClick={handleHotOfferClick}
                />
            ) : null}

            <div className="px-4 py-4 space-y-4">
                {activeList.isInitialLoading ? (
                    <ShiftSkeleton />
                ) : activeList.error ? (
                    <div className="text-center py-8 text-destructive">Ошибка загрузки {feedType === 'shifts' ? 'смен' : 'вакансий'}</div>
                ) : filteredShifts.length === 0 && (activeList.totalCount === 0 || (!activeList.isFetching && activeList.totalCount !== -1)) ? (
                    <EmptyState
                        message={
                            quickFilter !== 'all' || advancedFilters
                                ? 'По вашим фильтрам ничего не найдено'
                                : feedType === 'shifts'
                                    ? 'Смены не найдены'
                                    : 'Вакансии не найдены'
                        }
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
                                initial={index < 6 ? { y: 16, opacity: 0 } : false}
                                animate={index < 6 ? { y: 0, opacity: 1 } : undefined}
                                transition={index < 6 ? { delay: 0.15 + index * 0.04 } : undefined}
                            >
                                <ShiftCard
                                    shift={shift}
                                    applicationId={appliedApplicationsMap[shift.id] ?? getApplicationId(shift.id)}
                                    applicationStatus={activeList.vacanciesMap.get(shift.id)?.my_application?.status ?? null}
                                    isApplied={appliedShiftsSet.has(shift.id)}
                                    onOpenDetails={handleOpenShiftDetails}
                                    onApply={handleApplyWithModal}
                                    onCancel={handleCancel}
                                    isLoading={isShiftLoading(shift.id)}
                                />
                            </motion.div>
                        ))}

                        {filteredShifts.length > 0 ? (
                            <InfiniteScrollTrigger
                                onLoadMore={activeList.loadMore}
                                hasMore={activeList.hasMore}
                                isLoading={activeList.isFetching}
                                isError={!!activeList.error}
                            />
                        ) : null}
                    </>
                )}
            </div>

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />

            {selectedShiftId ? (
                <ShiftDetailsScreen
                    shift={selectedShift}
                    vacancyData={selectedVacancy}
                    applicationId={appliedApplicationsMap[selectedShiftId] ?? getApplicationId(selectedShiftId)}
                    isOpen={!!selectedShiftId}
                    onClose={handleCloseShiftDetails}
                    onApply={handleApply}
                    onCancel={handleCancel}
                    isApplied={appliedShiftsSet.has(selectedShiftId)}
                    isLoading={isShiftLoading(selectedShiftId)}
                />
            ) : null}

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ошибка профиля</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setAlertOpen(false)}>Закрыть</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setAlertOpen(false)
                                // Устанавливаем флаг для перехода на профиль с открытием drawer
                                setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT, 'true')
                                // Отправляем событие для переключения таба
                                window.dispatchEvent(new CustomEvent('navigateToProfileEdit'))
                                // Отправляем событие для открытия drawer (если профиль уже открыт)
                                window.dispatchEvent(new CustomEvent('openProfileEdit'))
                            }}
                        >
                            Открыть профиль
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
