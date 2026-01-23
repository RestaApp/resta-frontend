import { memo, useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Check, Search } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  label?: string
  hint?: string
  allowCustomValue?: boolean // Разрешить ввод произвольного значения
}

export const Select = memo(function Select({
  value,
  onChange,
  options,
  placeholder = 'Выберите значение',
  disabled = false,
  className,
  label,
  hint,
  allowCustomValue = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const triggerInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)
  const displayValue = isOpen && allowCustomValue ? searchQuery : selectedOption?.label || value || placeholder

  // Фильтрация опций по поисковому запросу
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options

    const query = searchQuery.toLowerCase().trim()
    return options.filter((opt) => opt.label.toLowerCase().includes(query) || opt.value.toLowerCase().includes(query))
  }, [options, searchQuery])

  // Проверка, есть ли точное совпадение
  const hasExactMatch = useMemo(() => {
    if (!searchQuery.trim()) return false
    const query = searchQuery.toLowerCase().trim()
    return options.some((opt) => opt.label.toLowerCase() === query || opt.value.toLowerCase() === query)
  }, [options, searchQuery])

  // Позиция и размеры дропдауна
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0, width: 0, opensUp: false })
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

        // Высота нижней навигации (64px + safe area, обычно около 88px)
        const bottomNavHeight = 88
        const spaceBelow = viewportHeight - rect.bottom - bottomNavHeight
        const spaceAbove = rect.top
        const estimatedDropdownHeight = 320 // примерная высота дропдауна

        // Определяем, открывать вверх или вниз
        const opensUp = spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow

        const availableSpace = opensUp
          ? Math.max(spaceAbove - 20, 200)
          : Math.max(spaceBelow - 20, 200)

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
          const maxTop = viewportHeight - bottomNavHeight - Math.min(availableSpace, 320) - 8
          top = Math.min(rect.bottom + 8, maxTop)
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
  }, [isOpen])

  // Фокус на input при открытии
  useEffect(() => {
    if (!isOpen) return
    let rafId: number | null = null
    rafId = requestAnimationFrame(() => {
      searchInputRef.current?.focus()
      rafId = null
    })
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [isOpen])

  // Проверка, нужна ли прокрутка
  const [needsScroll, setNeedsScroll] = useState(false)
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false)

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const checkScroll = () => {
        const hasScroll = container.scrollHeight > container.clientHeight
        setNeedsScroll(hasScroll)
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 5
        setIsScrolledToBottom(isAtBottom)
      }

      checkScroll()
      container.addEventListener('scroll', checkScroll)
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [isOpen, options])

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Предотвращение скролла при открытом дропдауне
  // NOTE: keeping simple body scroll lock for now; consider replacing with shared util
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

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
    setIsOpen((prev) => !prev)
  }, [disabled])

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
            ; (firstOption as HTMLButtonElement).focus()
          }
        }
      }
    },
    [allowCustomValue, searchQuery, hasExactMatch, filteredOptions, handleSelect, onChange]
  )

  const trigger = allowCustomValue && isOpen ? (
    <div className="relative">
      <input
        ref={triggerInputRef}
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'flex h-11 w-full min-w-0 items-center rounded-xl border bg-input-background px-4 py-3 pr-10 text-base transition-all',
          'placeholder:text-muted-foreground',
          'border-border/50 focus-visible:outline-none focus-visible:border-purple-500/50 focus-visible:ring-4 focus-visible:ring-purple-500/10',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'border-purple-500/50 ring-4 ring-purple-500/10'
        )}
      />
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 text-muted-foreground transition-transform rotate-180 pointer-events-none"
      />
    </div>
  ) : (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      className={cn(
        'flex h-11 w-full min-w-0 items-center justify-between rounded-xl border bg-input-background px-4 py-3 text-base transition-all',
        'placeholder:text-muted-foreground',
        'border-border/50 focus-visible:outline-none focus-visible:border-purple-500/50 focus-visible:ring-4 focus-visible:ring-purple-500/10',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        isOpen && 'border-purple-500/50 ring-4 ring-purple-500/10',
        !value && 'text-muted-foreground'
      )}
    >
      <span className="truncate text-left">{displayValue}</span>
      <ChevronDown
        className={cn('ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
      />
    </button>
  )

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      {hint && <p className="text-xs text-muted-foreground mb-2">{hint}</p>}
      <div className="relative">
        {trigger}

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-black/20"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown Content */}
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: dropdownPosition.opensUp ? 8 : -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: dropdownPosition.opensUp ? 8 : -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="fixed z-50 overflow-hidden rounded-xl border border-border/30 bg-card shadow-lg backdrop-blur-sm"
                style={{
                  maxHeight: `${maxHeight}px`,
                  left: `${dropdownPosition.left}px`,
                  top: `${dropdownPosition.top}px`,
                  width: `${dropdownPosition.width}px`,
                  maxWidth: 'calc(100vw - 32px)', // Отступы от краев экрана
                }}
              >
                {/* Header with Search */}
                <div className="sticky top-0 z-10 border-b border-border/30 bg-card/95 backdrop-blur-sm p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        const newValue = e.target.value
                        setSearchQuery(newValue)
                        if (allowCustomValue) {
                          onChange(newValue)
                        }
                      }}
                      onKeyDown={handleInputKeyDown}
                      placeholder={placeholder}
                      className={cn(
                        'w-full h-9 pl-9 pr-3 rounded-lg border border-border/30 bg-input-background text-sm',
                        'placeholder:text-muted-foreground',
                        'focus-visible:outline-none focus-visible:border-purple-500/50 focus-visible:ring-2 focus-visible:ring-purple-500/10'
                      )}
                    />
                  </div>
                </div>

                {/* Scrollable Options Container */}
                <div
                  ref={scrollContainerRef}
                  className="overflow-y-auto overscroll-contain"
                  style={{ maxHeight: `${maxHeight - 88}px` }}
                >
                  <div className="p-2">
                    {filteredOptions.length === 0 ? (
                      <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                        {searchQuery.trim() ? 'Ничего не найдено' : 'Нет доступных вариантов'}
                      </div>
                    ) : (
                      <>
                        {filteredOptions.map((option) => {
                          const isSelected = value === option.value
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleSelect(option.value)}
                              className={cn(
                                'relative flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-colors',
                                'hover:bg-purple-500/10 focus:bg-purple-500/10 focus:outline-none',
                                isSelected && 'bg-purple-500/10 font-medium'
                              )}
                            >
                              {isSelected && (
                                <Check className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
                              )}
                              {!isSelected && <div className="h-4 w-4 shrink-0" />}
                              <span className={cn('flex-1 min-w-0 truncate', isSelected && 'font-semibold')}>{option.label}</span>
                            </button>
                          )
                        })}
                      </>
                    )}
                  </div>
                </div>

                {/* Визуальный индикатор конца списка */}
                {needsScroll && !isScrolledToBottom && (
                  <div className="sticky bottom-0 h-8 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
                )}

                {/* Индикатор границы внизу */}
                <div className="h-px bg-border/30" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
})
