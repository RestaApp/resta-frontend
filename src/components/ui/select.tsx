import { memo, useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { FormField } from '@/components/ui/form-field'
import { SelectDropdown } from './select/SelectDropdown'
import { SelectTrigger } from './select/SelectTrigger'
import type { SelectProps } from './select/types'

export type { SelectOption, SelectProps } from './select/types'

export const Select = memo(function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className,
  label,
  hint,
  error,
  allowCustomValue = false,
  searchable = true,
  forceDropdownBelow = false,
  bottomOffsetPx = 88,
}: SelectProps) {
  const { t } = useTranslation()
  const displayPlaceholder = placeholder ?? t('common.selectValue')
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const triggerInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useBodyScrollLock(isOpen)

  const selectedOption = options.find(opt => opt.value === value)
  const displayValue =
    isOpen && allowCustomValue ? searchQuery : selectedOption?.label || value || displayPlaceholder

  // Фильтрация опций по поисковому запросу
  const filteredOptions = useMemo(() => {
    if (!searchable) return options
    if (!searchQuery.trim()) return options

    const query = searchQuery.toLowerCase().trim()
    return options.filter(
      opt => opt.label.toLowerCase().includes(query) || opt.value.toLowerCase().includes(query)
    )
  }, [options, searchQuery, searchable])

  // Проверка, есть ли точное совпадение
  const hasExactMatch = useMemo(() => {
    if (!searchQuery.trim()) return false
    const query = searchQuery.toLowerCase().trim()
    return options.some(
      opt => opt.label.toLowerCase() === query || opt.value.toLowerCase() === query
    )
  }, [options, searchQuery])

  // Позиция и размеры дропдауна
  const [dropdownPosition, setDropdownPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
    opensUp: false,
  })
  const [maxHeight, setMaxHeight] = useState(280)

  // Расчет позиции и максимальной высоты дропдауна
  useEffect(() => {
    if (isOpen && containerRef.current) {
      let rafId: number | null = null

      const updatePosition = () => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth

        const spaceBelow = viewportHeight - rect.bottom - bottomOffsetPx
        const spaceAbove = rect.top
        const estimatedDropdownHeight = 320 // примерная высота дропдауна

        // Определяем, открывать вверх или вниз
        const opensUp = forceDropdownBelow
          ? false
          : spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow

        const availableSpace = opensUp
          ? Math.max(spaceAbove - 20, 200)
          : Math.max(spaceBelow - 20, forceDropdownBelow ? 120 : 200)

        // Корректируем позицию по горизонтали, чтобы не выходить за границы экрана
        let left = rect.left
        const dropdownWidth = rect.width
        if (left + dropdownWidth > viewportWidth - 16) {
          left = viewportWidth - dropdownWidth - 16
        }
        if (left < 16) {
          left = 16
        }

        // Вычисляем top позицию с учетом нижней навигации
        let top: number
        if (opensUp) {
          top = rect.top - Math.min(availableSpace, 320) - 8
        } else {
          top = rect.bottom + 8
        }

        setDropdownPosition({
          left,
          top,
          width: rect.width,
          opensUp,
        })
        setMaxHeight(Math.min(availableSpace, 320)) // максимум 320px
      }

      const throttledUpdate = () => {
        if (rafId !== null) return
        rafId = requestAnimationFrame(() => {
          updatePosition()
          rafId = null
        })
      }

      // initial
      throttledUpdate()
      window.addEventListener('resize', throttledUpdate)
      window.addEventListener('scroll', throttledUpdate, true)

      return () => {
        window.removeEventListener('resize', throttledUpdate)
        window.removeEventListener('scroll', throttledUpdate, true)
        if (rafId !== null) cancelAnimationFrame(rafId)
      }
    }
  }, [isOpen, bottomOffsetPx, forceDropdownBelow])

  // Фокус на input при открытии
  useEffect(() => {
    if (!isOpen || !searchable) return
    let rafId: number | null = null
    rafId = requestAnimationFrame(() => {
      searchInputRef.current?.focus()
      rafId = null
    })
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [isOpen, searchable])

  // Проверка, нужна ли прокрутка
  const [needsScroll, setNeedsScroll] = useState(false)
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false)

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const checkScroll = () => {
        const hasScroll = container.scrollHeight > container.clientHeight
        setNeedsScroll(hasScroll)
        const isAtBottom =
          container.scrollHeight - container.scrollTop <= container.clientHeight + 5
        setIsScrolledToBottom(isAtBottom)
      }

      checkScroll()
      container.addEventListener('scroll', checkScroll)
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [isOpen, options])

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue)
      setSearchQuery('')
      setIsOpen(false)
    },
    [onChange]
  )

  const handleToggle = useCallback(() => {
    if (disabled) return
    setSearchQuery('')
    setIsOpen(prev => !prev)
  }, [disabled])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setSearchQuery(newValue)
      if (allowCustomValue) {
        onChange(newValue)
      }
    },
    [allowCustomValue, onChange]
  )

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (allowCustomValue && searchQuery.trim() && !hasExactMatch) {
          onChange(searchQuery.trim())
          setIsOpen(false)
          setSearchQuery('')
        } else if (filteredOptions.length > 0) {
          handleSelect(filteredOptions[0].value)
        } else {
          // Если нет совпадений, но allowCustomValue включен, принимаем введенное значение
          if (allowCustomValue && searchQuery.trim()) {
            onChange(searchQuery.trim())
            setIsOpen(false)
            setSearchQuery('')
          }
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false)
        setSearchQuery('')
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        // Фокус на первую опцию
        if (filteredOptions.length > 0 && scrollContainerRef.current) {
          const firstOption = scrollContainerRef.current.querySelector('button')
          if (firstOption) {
            ;(firstOption as HTMLButtonElement).focus()
          }
        }
      }
    },
    [allowCustomValue, searchQuery, hasExactMatch, filteredOptions, handleSelect, onChange]
  )

  return (
    <FormField label={label} hint={hint} error={error} className={cn('w-full', className)}>
      <div className="relative" ref={containerRef}>
        <SelectTrigger
          allowCustomValue={allowCustomValue}
          isOpen={isOpen}
          disabled={disabled}
          error={error}
          displayPlaceholder={displayPlaceholder}
          displayValue={displayValue}
          value={value}
          searchQuery={searchQuery}
          triggerInputRef={triggerInputRef}
          onInputChange={handleInputChange}
          onInputKeyDown={handleInputKeyDown}
          onFocusInput={() => setIsOpen(true)}
          onToggle={handleToggle}
        />

        <SelectDropdown
          isOpen={isOpen}
          searchable={searchable}
          displayPlaceholder={displayPlaceholder}
          label={label}
          value={value}
          searchQuery={searchQuery}
          filteredOptions={filteredOptions}
          maxHeight={maxHeight}
          dropdownPosition={dropdownPosition}
          needsScroll={needsScroll}
          isScrolledToBottom={isScrolledToBottom}
          searchInputRef={searchInputRef}
          scrollContainerRef={scrollContainerRef}
          dropdownRef={dropdownRef}
          onClose={handleClose}
          onChangeSearch={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onSelect={handleSelect}
          t={key => t(key)}
        />
      </div>
    </FormField>
  )
})
