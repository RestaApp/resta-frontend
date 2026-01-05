import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useToast } from '@/hooks/useToast'
import { Tabs } from '@/components/ui/tabs'
import { useGetVacanciesQuery, useGetAppliedShiftsQuery } from '@/services/api/shiftsApi'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { getTelegramWebApp } from '@/utils/telegram'
import { useAppSelector } from '@/store/hooks'
import { DEFAULT_PRICE_RANGE, hasActiveFilters } from '@/utils/filters'
import { Toast } from '@/components/ui/toast'
import type { FeedType } from './types'
import type { Shift } from './types'
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

export const FeedPage = () => {
    useUserProfile()
    const { toast, hideToast } = useToast()
    const [feedType, setFeedType] = useState<FeedType>('shifts')
    const [appliedShifts, setAppliedShifts] = useState<number[]>([])
    const [loadingShiftId, setLoadingShiftId] = useState<number | null>(null)
    const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null)
    const [activeFilter, setActiveFilter] = useState('all')
    const [isFiltersOpen, setIsFiltersOpen] = useState(false)

    // Инициализируем фильтры синхронно, если у пользователя есть позиция
    const userData = useAppSelector(state => state.user.userData)
    const userPosition = userData?.position || userData?.employee_profile?.position

    // Lazy initialization для фильтров - вычисляется только один раз при первом рендере
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersData | null>(() => {
        const position = userData?.position || userData?.employee_profile?.position
        if (position) {
            return {
                priceRange: DEFAULT_PRICE_RANGE,
                selectedPosition: position,
                selectedSpecializations: [],
                startDate: null,
                endDate: null,
            }
        }
        return null
    })

    // Обновляем фильтры один раз, когда позиция пользователя стала известна после загрузки
    // Не переустанавливаем после ручного сброса (иначе position будет возвращаться)
    const initializedPositionRef = useRef(false)
    useEffect(() => {
        // Если уже инициализировали — выходим
        if (initializedPositionRef.current) return

        // Если при инициализации уже есть advancedFilters с позицией — считаем инициализированным
        if (advancedFilters?.selectedPosition) {
            initializedPositionRef.current = true
            return
        }

        // Если позиция загрузилась позже и фильтры пустые — задаём стартовые фильтры один раз
        if (userPosition && !advancedFilters) {
            setAdvancedFilters({
                priceRange: DEFAULT_PRICE_RANGE,
                selectedPosition: userPosition,
                selectedSpecializations: [],
                startDate: null,
                endDate: null,
            })
            initializedPositionRef.current = true
        }
    }, [userPosition, advancedFilters])

    const [currentPage, setCurrentPage] = useState(1)
    const [allShifts, setAllShifts] = useState<Shift[]>([])
    const [allVacancies, setAllVacancies] = useState<Map<number, VacancyApiItem>>(new Map())
    const [isDataProcessed, setIsDataProcessed] = useState(false)

    // Ref для отслеживания обработанных ответов, чтобы избежать повторной обработки
    const processedResponseRef = useRef<string | null>(null)

    // Состояния для вакансий (jobs)
    const [currentPageJobs, setCurrentPageJobs] = useState(1)
    const [allJobs, setAllJobs] = useState<Shift[]>([])
    const [allJobsVacancies, setAllJobsVacancies] = useState<Map<number, VacancyApiItem>>(new Map())
    const [isDataProcessedJobs, setIsDataProcessedJobs] = useState(false)

    // Ref для отслеживания обработанных ответов вакансий
    const processedJobsResponseRef = useRef<string | null>(null)

    // Формируем параметры запроса с учетом фильтров для смен (replacement)
    // Используем только параметры из API документации
    const queryParams = useMemo(() => {
        const params: Parameters<typeof useGetVacanciesQuery>[0] = {
            shift_type: 'replacement',
            page: currentPage,
            per_page: 5,
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

            // Используем позицию, если выбрана
            if (advancedFilters.selectedPosition) {
                params.position = advancedFilters.selectedPosition
            }

            // Используем специализацию, если выбрана (согласно API документации - string, не массив)
            // Передаем первую выбранную специализацию, если их несколько
            if (advancedFilters.selectedSpecializations && advancedFilters.selectedSpecializations.length > 0) {
                params.specialization = advancedFilters.selectedSpecializations[0]
            }

            // Используем даты, если выбраны
            if (advancedFilters.startDate) {
                params.start_date = advancedFilters.startDate
            }
            if (advancedFilters.endDate) {
                params.end_date = advancedFilters.endDate
            }
        }

        return params
    }, [activeFilter, advancedFilters, currentPage])

    // Формируем параметры запроса для горящих смен с учетом фильтров
    // Всегда urgent: true, но применяем расширенные фильтры
    const hotShiftsQueryParams = useMemo(() => {
        const params: Parameters<typeof useGetVacanciesQuery>[0] = {
            shift_type: 'replacement',
            urgent: true, // Горящие смены всегда срочные
            page: 1,
            per_page: 4, // Загружаем до 4 срочных смен для горящих предложений
        }

        // Применяем расширенные фильтры (быстрые фильтры не применяем, т.к. urgent уже true)
        if (advancedFilters) {
            if (advancedFilters.priceRange) {
                params.min_payment = advancedFilters.priceRange[0]
                params.max_payment = advancedFilters.priceRange[1]
            }

            // Используем позицию, если выбрана
            if (advancedFilters.selectedPosition) {
                params.position = advancedFilters.selectedPosition
            }

            // Используем специализацию, если выбрана
            if (advancedFilters.selectedSpecializations && advancedFilters.selectedSpecializations.length > 0) {
                params.specialization = advancedFilters.selectedSpecializations[0]
            }

            // Используем даты, если выбраны
            if (advancedFilters.startDate) {
                params.start_date = advancedFilters.startDate
            }
            if (advancedFilters.endDate) {
                params.end_date = advancedFilters.endDate
            }
        }

        return params
    }, [advancedFilters])

    // Формируем параметры запроса для вакансий (vacancy) с учетом фильтров
    const queryParamsJobs = useMemo(() => {
        const params: Parameters<typeof useGetVacanciesQuery>[0] = {
            shift_type: 'vacancy',
            page: currentPageJobs,
            per_page: 5,
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

            // Используем позицию, если выбрана
            if (advancedFilters.selectedPosition) {
                params.position = advancedFilters.selectedPosition
            }

            // Используем специализацию, если выбрана
            if (advancedFilters.selectedSpecializations && advancedFilters.selectedSpecializations.length > 0) {
                params.specialization = advancedFilters.selectedSpecializations[0]
            }

            // Используем даты, если выбраны
            if (advancedFilters.startDate) {
                params.start_date = advancedFilters.startDate
            }
            if (advancedFilters.endDate) {
                params.end_date = advancedFilters.endDate
            }
        }

        return params
    }, [activeFilter, advancedFilters, currentPageJobs])

    // Загрузка смен с поданными заявками
    const { data: appliedShiftsResponse } = useGetAppliedShiftsQuery(undefined, {
        refetchOnMountOrArgChange: true, // Обновлять при монтировании
    })

    // Загрузка горящих смен (urgent: true) для секции "Горящие смены" с учетом фильтров
    const { data: hotShiftsResponse } = useGetVacanciesQuery(hotShiftsQueryParams, {
        refetchOnMountOrArgChange: false,
        skip: feedType !== 'shifts', // Пропускаем запрос, если не выбран тип 'shifts'
    })

    // Загрузка всех смен (replacement) из API с фильтрами
    const { data: shiftsResponse, isLoading: isLoadingShifts, isError: isErrorShifts, isFetching } = useGetVacanciesQuery(queryParams, {
        refetchOnMountOrArgChange: false, // Не обновлять при монтировании, только при изменении параметров
        skip: feedType !== 'shifts', // Пропускаем запрос, если не выбран тип 'shifts'
    })

    // Загрузка всех вакансий (vacancy) из API с фильтрами
    const { data: jobsResponse, isLoading: isLoadingJobs, isError: isErrorJobs, isFetching: isFetchingJobs } = useGetVacanciesQuery(queryParamsJobs, {
        refetchOnMountOrArgChange: false,
        skip: feedType !== 'jobs', // Пропускаем запрос, если не выбран тип 'jobs'
    })

    // Объединяем новые данные смен с уже загруженными
    // Обрабатываем только основной запрос (shiftsResponse), hotShiftsResponse обрабатывается отдельно
    useEffect(() => {
        // Обрабатываем данные только если загрузка завершена (не в процессе загрузки)
        if (shiftsResponse && feedType === 'shifts' && !isFetching && !isLoadingShifts) {
            // API может возвращать pagination или meta
            const pagination = shiftsResponse.pagination || shiftsResponse.meta
            const responsePage = pagination?.current_page || currentPage

            // Создаем уникальный ключ для ответа (page + timestamp данных)
            const responseKey = `${responsePage}-${shiftsResponse.data?.length || 0}-${shiftsResponse.data?.[0]?.id || ''}`

            // Пропускаем обработку, если этот ответ уже был обработан
            if (processedResponseRef.current === responseKey) {
                return
            }

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
                // Данные обработаны только после завершения загрузки и обработки основного запроса
                setIsDataProcessed(true)
                processedResponseRef.current = responseKey
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
                    processedResponseRef.current = responseKey
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shiftsResponse, feedType, isFetching, isLoadingShifts])

    // Объединяем новые данные вакансий с уже загруженными
    useEffect(() => {
        // Обрабатываем данные только если загрузка завершена (не в процессе загрузки)
        if (jobsResponse && feedType === 'jobs' && !isFetchingJobs && !isLoadingJobs) {
            // API может возвращать pagination или meta
            const pagination = jobsResponse.pagination || jobsResponse.meta
            const responsePage = pagination?.current_page || currentPageJobs

            // Создаем уникальный ключ для ответа (page + timestamp данных)
            const responseKey = `${responsePage}-${jobsResponse.data?.length || 0}-${jobsResponse.data?.[0]?.id || ''}`

            // Пропускаем обработку, если этот ответ уже был обработан
            if (processedJobsResponseRef.current === responseKey) {
                return
            }

            // Для первой страницы всегда заменяем данные (даже если они пустые)
            if (responsePage === 1) {
                if (jobsResponse.data && Array.isArray(jobsResponse.data) && jobsResponse.data.length > 0) {
                    const newJobs = jobsResponse.data.map(mapVacancyToShift)
                    setAllJobs(newJobs)
                    const newMap = new Map<number, VacancyApiItem>()
                    jobsResponse.data.forEach(vacancy => {
                        newMap.set(vacancy.id, vacancy)
                    })
                    setAllJobsVacancies(newMap)
                } else {
                    // Пустой ответ - очищаем данные
                    setAllJobs([])
                    setAllJobsVacancies(new Map())
                }
                // Данные обработаны только после завершения загрузки и обработки основного запроса
                setIsDataProcessedJobs(true)
                processedJobsResponseRef.current = responseKey
            } else {
                // Последующие загрузки - добавляем к существующим
                if (jobsResponse.data && Array.isArray(jobsResponse.data) && jobsResponse.data.length > 0) {
                    const newJobs = jobsResponse.data.map(mapVacancyToShift)
                    setAllJobs(prev => {
                        const existingIds = new Set(prev.map(s => s.id))
                        const uniqueNewJobs = newJobs.filter(s => !existingIds.has(s.id))
                        return [...prev, ...uniqueNewJobs]
                    })
                    setAllJobsVacancies(prev => {
                        const newMap = new Map(prev)
                        jobsResponse.data.forEach(vacancy => {
                            if (!newMap.has(vacancy.id)) {
                                newMap.set(vacancy.id, vacancy)
                            }
                        })
                        return newMap
                    })
                    processedJobsResponseRef.current = responseKey
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobsResponse, feedType, isFetchingJobs, isLoadingJobs])

    // Сбрасываем пагинацию при изменении фильтров или типа фида
    // Используем ref для отслеживания предыдущих значений, чтобы не сбрасывать при каждом рендере
    const prevFiltersRef = useRef({ activeFilter, advancedFilters, feedType })

    useEffect(() => {
        const prevFilters = prevFiltersRef.current
        // Сравниваем advancedFilters более надежным способом
        const advancedFiltersChanged =
            !prevFilters.advancedFilters && advancedFilters ||
            prevFilters.advancedFilters && !advancedFilters ||
            (prevFilters.advancedFilters && advancedFilters && (
                JSON.stringify(prevFilters.advancedFilters) !== JSON.stringify(advancedFilters)
            ))

        const filtersChanged =
            prevFilters.activeFilter !== activeFilter ||
            prevFilters.feedType !== feedType ||
            advancedFiltersChanged

        if (filtersChanged) {
            // Обновляем ref сразу, чтобы избежать повторных срабатываний
            prevFiltersRef.current = { activeFilter, advancedFilters, feedType }

            // Сбрасываем состояние в одном батче
            // Используем функциональные обновления, чтобы React батчил их вместе
            setCurrentPage(1)
            setCurrentPageJobs(1)
            setAllShifts([])
            setAllVacancies(new Map())
            setAllJobs([])
            setAllJobsVacancies(new Map())
            setIsDataProcessed(false) // Сбрасываем флаг обработки при изменении фильтров
            setIsDataProcessedJobs(false)
            setSelectedShiftId(null) // Закрываем детальную карточку при изменении фильтров
            // Сбрасываем ref для отслеживания обработанных ответов
            processedResponseRef.current = null
            processedJobsResponseRef.current = null
        }
    }, [activeFilter, advancedFilters, feedType])

    // Используем все загруженные смены или вакансии в зависимости от типа фида
    const shifts: Shift[] = feedType === 'shifts' ? allShifts : allJobs

    // Проверяем, есть ли еще данные для загрузки смен
    const hasMore = useMemo(() => {
        const response = feedType === 'shifts' ? shiftsResponse : jobsResponse
        const items = feedType === 'shifts' ? allShifts : allJobs

        // API может возвращать pagination или meta
        const pagination = response?.pagination || response?.meta
        if (!pagination) return false

        // Проверяем, загружены ли все записи по total_count
        const totalCount = pagination.total_count
        if (totalCount !== undefined && totalCount !== null) {
            // Если загружено меньше записей, чем всего есть - значит есть еще данные
            if (items.length < totalCount) {
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
    }, [shiftsResponse, jobsResponse, allShifts.length, allJobs.length, feedType])

    // Функция для загрузки следующей страницы
    const handleLoadMore = useCallback(() => {
        const isLoading = feedType === 'shifts' ? isLoadingShifts : isLoadingJobs
        const isFetchingValue = feedType === 'shifts' ? isFetching : isFetchingJobs

        if (!isLoading && !isFetchingValue && hasMore) {
            if (feedType === 'shifts') {
                setCurrentPage(prev => prev + 1)
            } else {
                setCurrentPageJobs(prev => prev + 1)
            }
        }
    }, [feedType, isLoadingShifts, isLoadingJobs, isFetching, isFetchingJobs, hasMore])

    // Сохраняем данные из hotShiftsResponse в allVacancies и allShifts для доступа к детальной информации
    // Это делается только для доступа к детальной информации, не влияет на отображение списка
    useEffect(() => {
        if (hotShiftsResponse?.data && hotShiftsResponse.data.length > 0 && feedType === 'shifts') {
            // Добавляем только в allVacancies для доступа к детальной информации
            // Не добавляем в allShifts, чтобы не вызывать повторное отображение
            setAllVacancies(prev => {
                const newMap = new Map(prev)
                hotShiftsResponse.data.forEach(vacancy => {
                    if (!newMap.has(vacancy.id)) {
                        newMap.set(vacancy.id, vacancy)
                    }
                })
                return newMap
            })
        }
    }, [hotShiftsResponse, feedType])

    // Получаем горящие смены из отдельного запроса с urgent: true
    const actualHotShifts = useMemo(() => {
        if (hotShiftsResponse?.data && hotShiftsResponse.data.length > 0) {
            // Преобразуем данные из API в формат HotOffer
            return hotShiftsResponse.data.slice(0, 4).map(vacancy => {
                const shift = mapVacancyToShift(vacancy)
                // Убеждаемся, что payment всегда число
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
        // Если нет срочных смен, возвращаем пустой массив (моковые данные удалены)
        return []
    }, [hotShiftsResponse])

    // Получаем общее количество горящих смен
    const hotShiftsTotalCount = useMemo(() => {
        const pagination = hotShiftsResponse?.pagination || hotShiftsResponse?.meta
        return pagination?.total_count ?? undefined
    }, [hotShiftsResponse])

    // Обработчик для показа всех горящих смен (применяем фильтр urgent)
    const handleShowAllHotShifts = useCallback(() => {
        setActiveFilter('urgent')
        // Прокручиваем к началу списка смен
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    const feedTypeOptions: TabOption<FeedType>[] = [
        { id: 'shifts', label: '🔥 Смены' },
        { id: 'jobs', label: '💼 Вакансии' },
    ]

    const handleOpenShiftDetails = useCallback((shiftId: number) => {
        setSelectedShiftId(shiftId)
    }, [])

    const handleCloseShiftDetails = useCallback(() => {
        setSelectedShiftId(null)
    }, [])

    // Обновляем список appliedShifts на основе данных с сервера
    useEffect(() => {
        if (appliedShiftsResponse?.data) {
            const appliedIds = appliedShiftsResponse.data.map(vacancy => vacancy.id)
            setAppliedShifts(appliedIds)
        }
    }, [appliedShiftsResponse])

    // Мемоизируем Set для быстрой проверки isApplied
    const appliedShiftsSet = useMemo(() => new Set(appliedShifts), [appliedShifts])

    const { apply, cancel } = useShiftApplication({
        onSuccess: () => {
            // Не закрываем детальный экран при отклике с карточки
        },
    })

    const handleApply = useCallback(async (shiftId: number) => {
        setLoadingShiftId(shiftId)
        try {
            await apply(shiftId)
            // Обновляем локальное состояние для немедленного отображения
            setAppliedShifts(prev => {
                if (!prev.includes(shiftId)) {
                    return [...prev, shiftId]
                }
                return prev
            })
        } catch {
            // Ошибка уже обработана в хуке
        } finally {
            setLoadingShiftId(null)
        }
    }, [apply])

    const handleCancel = useCallback(async (shiftId: number) => {
        setLoadingShiftId(shiftId)
        try {
            await cancel(shiftId)
            // Обновляем локальное состояние для немедленного отображения
            setAppliedShifts(prev => prev.filter(id => id !== shiftId))
        } catch {
            // Ошибка уже обработана в хуке
        } finally {
            setLoadingShiftId(null)
        }
    }, [cancel])

    const handleResetFilters = () => {
        // Полный сброс состояния, чтобы сразу ушел запрос без старых параметров
        setActiveFilter('all')
        setAdvancedFilters(null)
        setCurrentPage(1)
        setCurrentPageJobs(1)
        setAllShifts([])
        setAllVacancies(new Map())
        setAllJobs([])
        setAllJobsVacancies(new Map())
        setIsDataProcessed(false)
        setIsDataProcessedJobs(false)
        setSelectedShiftId(null) // Закрываем детальную карточку при сбросе фильтров
    }

    const handleApplyAdvancedFilters = useCallback((filters: AdvancedFiltersData | null) => {
        setAdvancedFilters(filters)
    }, [])



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


    // Определяем, есть ли активные фильтры (расширенные или быстрые)
    const hasActiveAdvancedFilters = useMemo(() => {
        const hasActiveQuickFilter = activeFilter !== 'all'
        const hasAdvancedFilters = advancedFilters ? hasActiveFilters(advancedFilters) : false
        return hasActiveQuickFilter || hasAdvancedFilters
    }, [advancedFilters, activeFilter])

    // Количество отфильтрованных смен или вакансий
    const filteredCount = useMemo(() => {
        const response = feedType === 'shifts' ? shiftsResponse : jobsResponse
        const pagination = response?.pagination || response?.meta
        return pagination?.total_count ?? 0
    }, [shiftsResponse, jobsResponse, feedType])

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="top-0 z-10 bg-background/95 backdrop-blur-sm pt-2 transition-all border-border/50">
                <div className="px-4 pb-2">
                    <Tabs options={feedTypeOptions} activeId={feedType} onChange={setFeedType} />
                </div>
                <SearchFilters
                    onOpenFilters={() => setIsFiltersOpen(true)}
                    isLoading={feedType === 'shifts' ? isFetching : isFetchingJobs}
                    hasActiveFilters={hasActiveAdvancedFilters}
                    activeFilters={advancedFilters}
                />
            </div>

            {feedType === 'shifts' && actualHotShifts.length > 0 && (
                <HotOffers
                    items={actualHotShifts}
                    totalCount={hotShiftsTotalCount}
                    onShowAll={hotShiftsTotalCount && actualHotShifts.length < hotShiftsTotalCount ? handleShowAllHotShifts : undefined}
                    onItemClick={(item: HotOffer) => {
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
                {(feedType === 'shifts'
                    ? ((isLoadingShifts || isFetching) && currentPage === 1 && !isDataProcessed)
                    : ((isLoadingJobs || isFetchingJobs) && currentPageJobs === 1 && !isDataProcessedJobs)
                ) ? (
                    <ShiftSkeleton />
                ) : (feedType === 'shifts'
                    ? (isErrorShifts && currentPage === 1)
                    : (isErrorJobs && currentPageJobs === 1)
                ) ? (
                    <div className="text-center py-8 text-destructive">
                        Ошибка загрузки {feedType === 'shifts' ? 'смен' : 'вакансий'}
                    </div>
                ) : (feedType === 'shifts' ? isDataProcessed : isDataProcessedJobs) &&
                    filteredShifts.length === 0 ? (
                    <EmptyState
                        message={activeFilter !== 'all' || advancedFilters
                            ? 'По вашим фильтрам ничего не найдено'
                            : feedType === 'shifts' ? 'Смены не найдены' : 'Вакансии не найдены'}
                        onReset={handleResetFilters}
                        showResetButton={!!(activeFilter !== 'all' || advancedFilters)}
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
                        {/* Infinite Scroll Trigger - показываем только если есть загруженные данные */}
                        {filteredShifts.length > 0 && (
                            <InfiniteScrollTrigger
                                onLoadMore={handleLoadMore}
                                hasMore={hasMore}
                                isLoading={feedType === 'shifts' ? isFetching : isFetchingJobs}
                                isError={feedType === 'shifts' ? isErrorShifts : isErrorJobs}
                            />
                        )}
                    </>
                )}
            </div>

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />

            {/* Детальная карточка смены или вакансии */}
            {selectedShiftId && (
                <ShiftDetailsScreen
                    shift={shifts.find(s => s.id === selectedShiftId) || null}
                    vacancyData={
                        feedType === 'shifts'
                            ? allVacancies.get(selectedShiftId) || null
                            : allJobsVacancies.get(selectedShiftId) || null
                    }
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
                    // Объединяем все обновления состояния в один батч
                    // React 18 автоматически батчит синхронные setState, но важно вызывать их вместе
                    setActiveFilter('all')
                    setSelectedShiftId(null) // Закрываем детальную карточку при сбросе фильтров
                    // advancedFilters сбрасываются через onApply(null) из handleReset в useAdvancedFilters
                    // currentPage, allShifts, allVacancies будут сброшены через useEffect при изменении фильтров
                }}
            />
        </div>
    )
}


