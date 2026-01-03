import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useToast } from '../../hooks/useToast'
import { Tabs } from '../../components/ui/tabs'
import { useGetVacanciesQuery } from '../../services/api/shiftsApi'
import type { VacancyApiItem } from '../../services/api/shiftsApi'
import { getTelegramWebApp } from '../../utils/telegram'
import { useAppSelector } from '../../store/hooks'

import { Toast } from '../../components/ui/toast'
import type { FeedType } from '../Feed/types'
import type { Shift, Job } from '../Feed/types'
import type { TabOption } from '../../components/ui/tabs'
import { SearchFilters } from '../Feed/components/SearchFilters'
import { HotOffers } from '../Feed/components/HotOffers'
import { ShiftCard } from '../Feed/components/ShiftCard'
import { JobCard } from '../Feed/components/JobCard'
import { MapFAB } from '../Feed/components/MapFAB'
import { EmptyState } from '../Feed/components/EmptyState'
import { ShiftSkeleton } from '../../components/ui/ShiftSkeleton'
import { ShiftDetailsScreen } from '../Feed/components/ShiftDetailsScreen'
import { AdvancedFilters, type AdvancedFiltersData } from '../Feed/components/AdvancedFilters'
import { InfiniteScrollTrigger } from '../Feed/components/InfiniteScrollTrigger'

/**
 * Преобразует данные вакансии из API в формат Shift для компонента
 */
const mapVacancyToShift = (vacancy: VacancyApiItem): Shift => {
    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Дата не указана'
        try {
            const date = new Date(dateString)
            const day = date.getDate()
            const month = date.toLocaleDateString('ru-RU', { month: 'long' })
            return `${day} ${month}`
        } catch {
            return dateString
        }
    }

    const formatTime = (startTime?: string, endTime?: string): string => {
        if (!startTime && !endTime) return 'Время не указано'
        if (startTime && endTime) {
            const start = new Date(startTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            const end = new Date(endTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            return `${start} - ${end}`
        }
        return startTime || endTime || 'Время не указано'
    }

    /**
     * Рассчитывает длительность смены в часах
     */
    const getDuration = (start?: string, end?: string): string => {
        if (!start || !end) return ''
        try {
            const startDate = new Date(start)
            const endDate = new Date(end)
            const diffMs = endDate.getTime() - startDate.getTime()
            const diffHrs = Math.round(diffMs / (1000 * 60 * 60))
            return diffHrs > 0 ? `${diffHrs} ч.` : ''
        } catch {
            return ''
        }
    }

    /**
     * Получает оплату с приоритетом общей суммы над почасовой ставкой
     * Если есть общая сумма (payment) - используем её
     * Иначе считаем: hourly_rate * длительность
     */
    const getPayment = (payment?: string | number, hourlyRate?: string | number, startTime?: string, endTime?: string): number => {
        // Приоритет 1: Общая сумма (payment)
        if (payment) {
            const pay = typeof payment === 'string' ? parseFloat(payment) : payment
            if (!isNaN(pay) && pay > 0) {
                return pay
            }
        }

        // Приоритет 2: Почасовая ставка * длительность
        if (hourlyRate && startTime && endTime) {
            try {
                const rate = typeof hourlyRate === 'string' ? parseFloat(hourlyRate) : hourlyRate
                if (!isNaN(rate) && rate > 0) {
                    const startDate = new Date(startTime)
                    const endDate = new Date(endTime)
                    const diffMs = endDate.getTime() - startDate.getTime()
                    const diffHrs = diffMs / (1000 * 60 * 60)
                    const total = rate * diffHrs
                    return Math.round(total)
                }
            } catch {
                // Игнорируем ошибки парсинга
            }
        }

        // Приоритет 3: Только почасовая ставка (если нет длительности)
        if (hourlyRate) {
            const rate = typeof hourlyRate === 'string' ? parseFloat(hourlyRate) : hourlyRate
            if (!isNaN(rate) && rate > 0) {
                return rate
            }
        }

        return 0
    }

    const getLogo = (): string => {
        const logos = ['🌅', '🌸', '🍹', '🥖', '🍕', '☕️', '🍽', '🥘']
        return logos[vacancy.id % logos.length]
    }

    const duration = getDuration(vacancy.start_time, vacancy.end_time)
    const timeFormatted = formatTime(vacancy.start_time, vacancy.end_time)
    const timeWithDuration = duration ? `${timeFormatted} (${duration})` : timeFormatted

    return {
        id: vacancy.id,
        logo: getLogo(),
        restaurant: vacancy.user?.name || vacancy.user?.full_name || vacancy.title || 'Ресторан',
        rating: vacancy.user?.average_rating || 4.5,
        position: vacancy.target_roles?.[0] || 'Сотрудник',
        date: formatDate(vacancy.start_time),
        time: timeWithDuration,
        pay: getPayment(vacancy.payment, vacancy.hourly_rate, vacancy.start_time, vacancy.end_time),
        currency: 'BYN',
        location: vacancy.location || vacancy.user?.restaurant_profile?.city || '',
        duration,
        urgent: vacancy.urgent || false,
        badges: vacancy.urgent ? ['🔥 Срочно'] : undefined,
    }
}

const jobs: Job[] = [
    {
        id: 1,
        logo: '🍕',
        restaurant: 'Pizzeria Napoli',
        rating: 4.6,
        position: 'Пиццайоло',
        schedule: '5/2',
        salary: 'от 2500',
        currency: 'BYN',
    },
    {
        id: 2,
        logo: '☕️',
        restaurant: 'Coffee House',
        rating: 4.8,
        position: 'Бариста',
        schedule: '2/2',
        salary: 'от 2000',
        currency: 'BYN',
    },
]

export const FeedPage = () => {
    useUserProfile()
    const { toast, showToast, hideToast } = useToast()
    const [feedType, setFeedType] = useState<FeedType>('shifts')
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [appliedShifts, setAppliedShifts] = useState<number[]>([])
    const [showMapFAB] = useState(true)
    const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null)
    const [activeFilter, setActiveFilter] = useState('all')
    const [isFiltersOpen, setIsFiltersOpen] = useState(false)
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersData | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [allShifts, setAllShifts] = useState<Shift[]>([])
    const [allVacancies, setAllVacancies] = useState<Map<number, VacancyApiItem>>(new Map())

    // Загрузка горящих смен (urgent: true) для секции "Горящие смены"
    const { data: hotShiftsResponse } = useGetVacanciesQuery({
        shift_type: 'replacement',
        urgent: true,
        page: 1,
        per_page: 4, // Загружаем до 4 срочных смен для горящих предложений
    })

    // Debounce для поиска (300ms задержка, но для пустого значения сразу)
    useEffect(() => {
        // Если запрос пустой, обновляем сразу (без задержки)
        if (query === '') {
            setDebouncedQuery('')
            return
        }

        // Для непустого запроса используем debounce
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    // Формируем параметры запроса с учетом фильтров
    const queryParams = useMemo(() => {
        const params: Parameters<typeof useGetVacanciesQuery>[0] = {
            shift_type: 'replacement',
            page: currentPage,
            per_page: 5,
        }

        // Поиск по тексту (используем debounced значение)
        if (debouncedQuery) {
            params.search = debouncedQuery
        }

        // Быстрые фильтры
        if (activeFilter === 'urgent') {
            params.urgent = true
        }

        // Расширенные фильтры
        if (advancedFilters) {
            if (advancedFilters.priceRange) {
                params.min_payment = advancedFilters.priceRange[0]
                params.max_payment = advancedFilters.priceRange[1]
            }

            if (advancedFilters.selectedRoles.length > 0) {
                // Преобразуем названия ролей в формат API
                const roleMapping: Record<string, string> = {
                    'Повар': 'chef',
                    'Су-шеф': 'chef',
                    'Бармен': 'bartender',
                    'Официант': 'waiter',
                    'Бариста': 'barista',
                    'Мойщик': 'support',
                    'Админ': 'manager',
                }
                params.target_roles = advancedFilters.selectedRoles
                    .map(role => roleMapping[role] || role.toLowerCase())
                    .filter(Boolean)
            }

            if (advancedFilters.timeOfDay.length > 0) {
                params.time_of_day = advancedFilters.timeOfDay
            }
        }

        return params
    }, [debouncedQuery, activeFilter, advancedFilters, currentPage])

    // Загрузка всех смен (replacement) из API с фильтрами
    const { data: shiftsResponse, isLoading: isLoadingShifts, isError: isErrorShifts, isFetching } = useGetVacanciesQuery(queryParams, {
        refetchOnMountOrArgChange: true, // Обновлять при изменении параметров
        // Принудительно обновлять данные при изменении параметров, игнорируя кэш
        skip: false,
    })

    // Флаг для отслеживания обработки данных
    const [isDataProcessed, setIsDataProcessed] = useState(false)

    // Объединяем новые данные с уже загруженными
    useEffect(() => {
        if (shiftsResponse) {
            // API может возвращать pagination или meta
            const pagination = shiftsResponse.pagination || shiftsResponse.meta
            const responsePage = pagination?.current_page || currentPage

            // Для первой страницы всегда заменяем данные (даже если они пустые)
            if (responsePage === 1) {
                if (shiftsResponse.data && Array.isArray(shiftsResponse.data) && shiftsResponse.data.length > 0) {
                    const newShifts = shiftsResponse.data.map(mapVacancyToShift)
                    setAllShifts(newShifts)
                    const newMap = new Map<number, VacancyApiItem>()
                    shiftsResponse.data.forEach(vacancy => {
                        newMap.set(vacancy.id, vacancy)
                    })
                    setAllVacancies(newMap)
                } else {
                    // Пустой ответ - очищаем данные
                    setAllShifts([])
                    setAllVacancies(new Map())
                }
            } else {
                // Последующие загрузки - добавляем к существующим
                if (shiftsResponse.data && Array.isArray(shiftsResponse.data) && shiftsResponse.data.length > 0) {
                    const newShifts = shiftsResponse.data.map(mapVacancyToShift)
                    setAllShifts(prev => {
                        const existingIds = new Set(prev.map(s => s.id))
                        const uniqueNewShifts = newShifts.filter(s => !existingIds.has(s.id))
                        return [...prev, ...uniqueNewShifts]
                    })
                    setAllVacancies(prev => {
                        const newMap = new Map(prev)
                        shiftsResponse.data.forEach(vacancy => {
                            if (!newMap.has(vacancy.id)) {
                                newMap.set(vacancy.id, vacancy)
                            }
                        })
                        return newMap
                    })
                }
            }
            // Данные обработаны
            setIsDataProcessed(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shiftsResponse])

    // Сбрасываем пагинацию при изменении фильтров
    useEffect(() => {
        setCurrentPage(1)
        setAllShifts([])
        setAllVacancies(new Map())
        setIsDataProcessed(false) // Сбрасываем флаг обработки при изменении фильтров
    }, [debouncedQuery, activeFilter, advancedFilters])

    // Используем все загруженные смены
    const shifts: Shift[] = allShifts

    // Проверяем, есть ли еще данные для загрузки
    const hasMore = useMemo(() => {
        // API может возвращать pagination или meta
        const pagination = shiftsResponse?.pagination || shiftsResponse?.meta
        if (!pagination) return false

        // Проверяем, загружены ли все записи по total_count
        const totalCount = pagination.total_count
        if (totalCount !== undefined && totalCount !== null) {
            // Если загружено меньше записей, чем всего есть - значит есть еще данные
            if (allShifts.length < totalCount) {
                return true
            }
            // Если загружено столько же или больше - значит все загружено
            return false
        }

        // Fallback: проверяем через next_page (если есть) или через сравнение страниц
        if (pagination.next_page !== undefined && pagination.next_page !== null) {
            return true
        }

        const { current_page, total_pages } = pagination
        if (current_page && total_pages) {
            return current_page < total_pages
        }

        return false
    }, [shiftsResponse, allShifts.length])

    // Функция для загрузки следующей страницы
    const handleLoadMore = useCallback(() => {
        if (!isLoadingShifts && !isFetching && hasMore) {
            setCurrentPage(prev => prev + 1)
        }
    }, [isLoadingShifts, isFetching, hasMore])

    // Получаем горящие смены из отдельного запроса с urgent: true
    const actualHotShifts = useMemo(() => {
        if (hotShiftsResponse?.data && hotShiftsResponse.data.length > 0) {
            // Преобразуем данные из API в формат HotOffer
            return hotShiftsResponse.data.slice(0, 4).map(vacancy => {
                const shift = mapVacancyToShift(vacancy)
                return {
                    id: shift.id,
                    emoji: shift.logo,
                    boost: 'x1.5', // Можно добавить в API или рассчитать
                    time: shift.date,
                    restaurant: shift.restaurant,
                }
            })
        }
        // Если нет срочных смен, возвращаем пустой массив (моковые данные удалены)
        return []
    }, [hotShiftsResponse])

    const feedTypeOptions: TabOption<FeedType>[] = [
        { id: 'shifts', label: '🔥 Смены' },
        { id: 'jobs', label: '💼 Вакансии' },
    ]

    const handleOpenShiftDetails = (shiftId: number) => {
        setSelectedShiftId(shiftId)
    }

    const handleCloseShiftDetails = () => {
        setSelectedShiftId(null)
    }

    const handleApply = (shiftId: number) => {
        // Используем нативный HapticFeedback из Telegram WebApp
        const webApp = getTelegramWebApp()
        if (webApp?.HapticFeedback) {
            try {
                webApp.HapticFeedback.impactOccurred('light')
            } catch {
                // Fallback на стандартный vibrate
                if (navigator.vibrate) {
                    navigator.vibrate(50)
                }
            }
        } else if (navigator.vibrate) {
            navigator.vibrate(50)
        }
        setAppliedShifts(prev => [...prev, shiftId])
        showToast('✅ Заявка отправлена! Если вас утвердят, бот пришлет сообщение.', 'success')
        handleCloseShiftDetails()
    }

    const handleResetFilters = () => {
        setQuery('')
        setActiveFilter('all')
        setAdvancedFilters(null)
    }

    const handleApplyAdvancedFilters = useCallback((filters: AdvancedFiltersData) => {
        setAdvancedFilters(filters)
    }, [])

    // Получаем данные пользователя для фильтра "Моя роль"
    const userData = useAppSelector(state => state.user.userData)
    const userPosition = userData?.position || userData?.employee_profile?.position


    // Смены уже отфильтрованы на сервере, но применяем клиентские фильтры для быстрых фильтров
    // которые не поддерживаются API (high_pay, nearby, my_role)
    const filteredShifts = useMemo(() => {
        let result = [...shifts]

        // Быстрые фильтры, которые требуют клиентской обработки
        switch (activeFilter) {
            case 'high_pay':
                // Сортируем по оплате и берем топ 30%
                result = result.sort((a, b) => b.pay - a.pay).slice(0, Math.ceil(result.length * 0.3))
                break
            case 'nearby':
                // TODO: Реализовать сортировку по дистанции когда будет геолокация
                // Пока просто сортируем по алфавиту
                result = result.sort((a, b) => a.location?.localeCompare(b.location || '') || 0)
                break
            case 'my_role':
                if (userPosition) {
                    result = result.filter(s => {
                        const shiftPosition = s.position.toLowerCase()
                        const userPos = userPosition.toLowerCase()
                        return shiftPosition.includes(userPos) || userPos.includes(shiftPosition)
                    })
                }
                break
            case 'urgent':
            case 'all':
            default:
                // urgent и все остальное уже обработано на сервере
                break
        }

        return result
    }, [shifts, activeFilter, userPosition])


    const handleContact = (restaurant: string) => {
        showToast(`Открытие Telegram-чата с менеджером "${restaurant}"`, 'info')
    }

    const handleOpenMap = () => {
        showToast('🗺 Открытие карты с метками смен', 'info')
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="top-0 z-10 bg-background/95 backdrop-blur-sm pb-2 pt-2 transition-all border-b border-border/50">
                <div className="px-4 pb-2">
                    <Tabs options={feedTypeOptions} activeId={feedType} onChange={setFeedType} />
                </div>
                <SearchFilters
                    query={query}
                    onQueryChange={setQuery}
                    onOpenFilters={() => setIsFiltersOpen(true)}
                    isLoading={isFetching}
                />
            </div>

            {feedType === 'shifts' && (
                <HotOffers
                    items={actualHotShifts}
                    onItemClick={(item) => {
                        // HapticFeedback при клике
                        const webApp = getTelegramWebApp()
                        if (webApp?.HapticFeedback) {
                            try {
                                webApp.HapticFeedback.impactOccurred('light')
                            } catch {
                                if (navigator.vibrate) {
                                    navigator.vibrate(50)
                                }
                            }
                        } else if (navigator.vibrate) {
                            navigator.vibrate(50)
                        }

                        // Если это реальная смена (id из API), открываем напрямую
                        const shift = shifts.find(s => s.id === item.id)
                        if (shift) {
                            handleOpenShiftDetails(shift.id)
                        } else {
                            // Если это моковая смена, пытаемся найти по названию ресторана
                            const foundShift = shifts.find(s => {
                                const shiftName = s.restaurant.toLowerCase()
                                const itemName = item.restaurant.toLowerCase()
                                return shiftName.includes(itemName) || itemName.includes(shiftName)
                            })
                            if (foundShift) {
                                handleOpenShiftDetails(foundShift.id)
                            }
                        }
                    }}
                />
            )}

            <div className="px-4 py-4 space-y-4">
                {feedType === 'shifts' ? (
                    (isLoadingShifts || isFetching) && currentPage === 1 && allShifts.length === 0 ? (
                        <ShiftSkeleton />
                    ) : isErrorShifts && currentPage === 1 ? (
                        <div className="text-center py-8 text-destructive">Ошибка загрузки смен</div>
                    ) : !isFetching && !isLoadingShifts && isDataProcessed && filteredShifts.length === 0 ? (
                        <EmptyState
                            message={debouncedQuery || activeFilter !== 'all' || advancedFilters
                                ? 'По вашим фильтрам ничего не найдено'
                                : 'Смены не найдены'}
                            onReset={handleResetFilters}
                            showResetButton={!!(debouncedQuery || activeFilter !== 'all' || advancedFilters)}
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
                                        isApplied={appliedShifts.includes(shift.id)}
                                        onApply={handleOpenShiftDetails}
                                    />
                                </motion.div>
                            ))}
                            {/* Infinite Scroll Trigger - показываем только если есть загруженные смены */}
                            {filteredShifts.length > 0 && (
                                <InfiniteScrollTrigger
                                    onLoadMore={handleLoadMore}
                                    hasMore={hasMore}
                                    isLoading={isFetching}
                                    isError={isErrorShifts}
                                />
                            )}
                        </>
                    )
                ) : (
                    jobs
                        .filter(j => j.restaurant.toLowerCase().includes(query.toLowerCase()) || j.position.toLowerCase().includes(query.toLowerCase()))
                        .map((job, index) => (
                            <motion.div key={job.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + index * 0.05 }}>
                                <JobCard job={job} onContact={handleContact} />
                            </motion.div>
                        ))
                )}
            </div>

            {showMapFAB && <MapFAB onOpen={handleOpenMap} />}

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />

            {/* Детальная карточка смены */}
            {selectedShiftId && (
                <ShiftDetailsScreen
                    shift={shifts.find(s => s.id === selectedShiftId) || null}
                    vacancyData={allVacancies.get(selectedShiftId) || null}
                    isOpen={!!selectedShiftId}
                    onClose={handleCloseShiftDetails}
                    onApply={handleApply}
                    isApplied={appliedShifts.includes(selectedShiftId)}
                />
            )}

            {/* Расширенные фильтры */}
            <AdvancedFilters
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
                onApply={handleApplyAdvancedFilters}
                initialFilters={advancedFilters || undefined}
                filteredCount={filteredShifts.length}
                searchQuery={query}
                activeFilter={activeFilter}
                onReset={() => {
                    setAdvancedFilters(null)
                    setQuery('')
                    setActiveFilter('all')
                }}
            />
        </div>
    )
}


