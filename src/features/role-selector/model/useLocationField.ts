/**
 * Хук для управления бизнес-логикой поля выбора города
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useCities } from '@/hooks/useCities'

interface UseLocationFieldProps {
    value: string
    onChange: (value: string) => void
    initialVisibleCount?: number
    loadMoreThreshold?: number
    loadMoreStep?: number
}

interface ValidationResult {
    isValid: boolean
    errorMessage: string | null
    normalizedValue?: string
}

export const useLocationField = ({
    value,
    onChange,
    initialVisibleCount = 10,
    loadMoreThreshold = 0.8,
    loadMoreStep = 10,
}: UseLocationFieldProps) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [visibleCount, setVisibleCount] = useState(initialVisibleCount)
    const [isValid, setIsValid] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    // Загружаем города при фокусе на поле
    const { cities, isLoading: isLoadingCities } = useCities({
        enabled: isFocused,
    })

    // Фильтруем города по введенному тексту
    const allFilteredCities = useMemo(() => {
        if (!value.trim()) {
            return cities
        }

        const searchTerm = value.toLowerCase().trim()
        return cities.filter(city => city.toLowerCase().includes(searchTerm))
    }, [cities, value])

    // Отображаем только видимые города (для подгрузки при скролле)
    const filteredCities = useMemo(() => {
        return allFilteredCities.slice(0, visibleCount)
    }, [allFilteredCities, visibleCount])

    const hasMore = allFilteredCities.length > visibleCount

    // Сбрасываем счетчик видимых элементов при изменении поискового запроса
    useEffect(() => {
        setVisibleCount(initialVisibleCount)
    }, [value, initialVisibleCount])

    // Обработчик скролла для подгрузки дополнительных городов
    useEffect(() => {
        const listElement = listRef.current
        if (!listElement || !hasMore) return

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = listElement
            // Подгружаем когда пользователь прокрутил до указанного порога
            if (scrollTop + clientHeight >= scrollHeight * loadMoreThreshold) {
                setVisibleCount(prev => Math.min(prev + loadMoreStep, allFilteredCities.length))
            }
        }

        listElement.addEventListener('scroll', handleScroll)
        return () => {
            listElement.removeEventListener('scroll', handleScroll)
        }
    }, [hasMore, allFilteredCities.length, loadMoreThreshold, loadMoreStep])

    // Закрываем список при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false)
                setIsFocused(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Валидация города
    const validateCity = useCallback((cityValue: string): ValidationResult => {
        if (!cityValue.trim()) {
            return {
                isValid: true,
                errorMessage: null,
            }
        }

        const trimmedValue = cityValue.trim()
        const exactMatch = cities.find(
            city => city.toLowerCase() === trimmedValue.toLowerCase()
        )

        if (exactMatch) {
            // Используем точное значение из списка (с правильным регистром)
            if (exactMatch !== trimmedValue) {
                onChange(exactMatch)
            }
            return {
                isValid: true,
                errorMessage: null,
                normalizedValue: exactMatch,
            }
        }

        // Если остался только один вариант - используем его
        if (allFilteredCities.length === 1) {
            onChange(allFilteredCities[0])
            return {
                isValid: true,
                errorMessage: null,
                normalizedValue: allFilteredCities[0],
            }
        }

        // Если есть варианты, но нет точного совпадения
        if (allFilteredCities.length > 0) {
            return {
                isValid: false,
                errorMessage: 'Выберите город из списка',
            }
        }

        // Если нет вариантов вообще
        return {
            isValid: false,
            errorMessage: 'Город не найден. Выберите из списка',
        }
    }, [cities, allFilteredCities, onChange])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        onChange(newValue)
        setShowSuggestions(true)
        // Сбрасываем ошибку при вводе
        if (!isValid) {
            setIsValid(true)
            setErrorMessage(null)
        }
    }, [onChange, isValid])

    const handleInputFocus = useCallback(() => {
        setIsFocused(true)
        setShowSuggestions(true)
        // Сбрасываем ошибку при фокусе
        setIsValid(true)
        setErrorMessage(null)
    }, [])

    const handleInputBlur = useCallback(() => {
        // Не закрываем сразу, чтобы можно было кликнуть на элемент списка
        setTimeout(() => {
            setShowSuggestions(false)
            setIsFocused(false)

            // Валидация при потере фокуса
            if (value.trim()) {
                const validation = validateCity(value)
                setIsValid(validation.isValid)
                setErrorMessage(validation.errorMessage)
            } else {
                setIsValid(true)
                setErrorMessage(null)
            }
        }, 200)
    }, [value, validateCity])

    const handleCitySelect = useCallback((city: string) => {
        onChange(city)
        setShowSuggestions(false)
        setIsFocused(false)
        inputRef.current?.blur()
    }, [onChange])

    const hasSuggestions = filteredCities.length > 0 && showSuggestions

    return {
        // Состояние
        isFocused,
        showSuggestions,
        isValid,
        errorMessage,
        isLoadingCities,
        hasSuggestions,
        hasMore,
        
        // Данные
        filteredCities,
        allFilteredCities,
        
        // Refs
        inputRef,
        containerRef,
        listRef,
        
        // Обработчики
        handleInputChange,
        handleInputFocus,
        handleInputBlur,
        handleCitySelect,
    }
}
