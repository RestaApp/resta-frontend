import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useCities } from '@/shared/lib/hooks/useCities'

interface UseCityAutocompleteProps {
  value: string
  onChange: (value: string) => void
  options?: string[]
  isLoadingOptions?: boolean
  validateOnBlur?: boolean
  disabled?: boolean
}

interface ValidationResult {
  isValid: boolean
  errorMessage: string | null
  normalizedValue?: string
}

const OPEN_SCROLL_GUARD_MS = 450

export const useCityAutocomplete = ({
  value,
  onChange,
  options,
  isLoadingOptions = false,
  validateOnBlur = true,
  disabled = false,
}: UseCityAutocompleteProps) => {
  const { t } = useTranslation()
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const suggestionsOpenedAtRef = useRef(0)

  const usesExternalOptions = options != null
  const { cities: fetchedCities, isLoading: isFetchingCities } = useCities({
    enabled: !usesExternalOptions && isFocused,
  })

  const cities = usesExternalOptions ? options : fetchedCities
  const isLoadingCities = usesExternalOptions ? isLoadingOptions : isFetchingCities

  const filteredCities = useMemo(() => {
    if (!value.trim()) {
      return cities
    }

    const searchTerm = value.toLowerCase().trim()
    return cities.filter(city => city.toLowerCase().includes(searchTerm))
  }, [cities, value])

  useEffect(() => {
    if (!showSuggestions) return
    suggestionsOpenedAtRef.current = Date.now()
  }, [showSuggestions])

  useEffect(() => {
    if (!showSuggestions) return

    const handleExternalScroll = (event: Event) => {
      const target = event.target as Node | null

      if (target && listRef.current?.contains(target)) {
        return
      }

      if (Date.now() - suggestionsOpenedAtRef.current < OPEN_SCROLL_GUARD_MS) {
        return
      }

      setShowSuggestions(false)
      setIsFocused(false)
      inputRef.current?.blur()
    }

    window.addEventListener('scroll', handleExternalScroll, true)
    return () => {
      window.removeEventListener('scroll', handleExternalScroll, true)
    }
  }, [showSuggestions])

  const validateCity = useCallback(
    (cityValue: string): ValidationResult => {
      if (!validateOnBlur || !cityValue.trim()) {
        return {
          isValid: true,
          errorMessage: null,
        }
      }

      const trimmedValue = cityValue.trim()
      const exactMatch = cities.find(city => city.toLowerCase() === trimmedValue.toLowerCase())

      if (exactMatch) {
        if (exactMatch !== trimmedValue) {
          onChange(exactMatch)
        }
        return {
          isValid: true,
          errorMessage: null,
          normalizedValue: exactMatch,
        }
      }

      if (filteredCities.length === 1) {
        onChange(filteredCities[0])
        return {
          isValid: true,
          errorMessage: null,
          normalizedValue: filteredCities[0],
        }
      }

      if (filteredCities.length > 0) {
        return {
          isValid: false,
          errorMessage: t('selectCityFromList'),
        }
      }

      return {
        isValid: false,
        errorMessage: t('cityNotFound'),
      }
    },
    [cities, filteredCities, onChange, t, validateOnBlur]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return
      onChange(e.target.value)
      setShowSuggestions(true)
      if (!isValid) {
        setIsValid(true)
        setErrorMessage(null)
      }
    },
    [disabled, isValid, onChange]
  )

  const handleInputFocus = useCallback(() => {
    if (disabled) return
    setIsFocused(true)
    setShowSuggestions(true)
    setIsValid(true)
    setErrorMessage(null)
  }, [disabled])

  const handleInputBlur = useCallback(() => {
    setTimeout(() => {
      setShowSuggestions(false)
      setIsFocused(false)

      if (!validateOnBlur) {
        setIsValid(true)
        setErrorMessage(null)
        return
      }

      if (value.trim()) {
        const validation = validateCity(value)
        setIsValid(validation.isValid)
        setErrorMessage(validation.errorMessage)
      } else {
        setIsValid(true)
        setErrorMessage(null)
      }
    }, 200)
  }, [validateCity, validateOnBlur, value])

  const handleCitySelect = useCallback(
    (city: string) => {
      if (disabled) return
      onChange(city)
      setShowSuggestions(false)
      setIsFocused(false)
      setIsValid(true)
      setErrorMessage(null)
      inputRef.current?.blur()
    },
    [disabled, onChange]
  )

  const handleDropdownClose = useCallback(() => {
    setShowSuggestions(false)
    setIsFocused(false)
  }, [])

  const hasSuggestions = filteredCities.length > 0 && showSuggestions

  return {
    isFocused,
    showSuggestions,
    isValid,
    errorMessage,
    isLoadingCities,
    hasSuggestions,
    filteredCities,
    inputRef,
    containerRef,
    listRef,
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    handleCitySelect,
    handleDropdownClose,
  }
}
