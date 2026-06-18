import { memo, useState, useRef, useEffect, useCallback, useMemo, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/utils/cn'
import { FormField } from '@/components/ui/form-field'
import { SelectDropdown } from './select/SelectDropdown'
import { SelectTrigger } from './select/SelectTrigger'
import { useSelectDropdownShell } from './select/useSelectDropdownShell'
import type { SelectProps } from './select/types'
import { BOTTOM_NAV_HEIGHT_PX } from '@/shared/ui/layout'

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
  searchable = false,
  portaled = false,
  withOverlay = false,
  bottomOffsetPx = BOTTOM_NAV_HEIGHT_PX,
}: SelectProps) {
  const { t } = useTranslation()
  const listboxId = useId()
  const displayPlaceholder = placeholder ?? t('common.selectValue')
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleDismiss = useCallback(() => {
    setIsOpen(false)
    setSearchQuery('')
  }, [])

  const { containerRef, dropdownRef, effectivePortaled } = useSelectDropdownShell({
    isOpen,
    portaled,
    withOverlay,
    bottomOffsetPx,
    onDismiss: handleDismiss,
  })

  const selectedOption = options.find(opt => opt.value === value)
  const displayValue = selectedOption?.label || value || ''

  const filteredOptions = useMemo(() => {
    if (!searchable) return options
    if (!searchQuery.trim()) return options

    const query = searchQuery.toLowerCase().trim()
    return options.filter(
      opt => opt.label.toLowerCase().includes(query) || opt.value.toLowerCase().includes(query)
    )
  }, [options, searchQuery, searchable])

  useEffect(() => {
    if (!isOpen || !searchable) return
    let rafId: number | null = null
    rafId = requestAnimationFrame(() => {
      searchInputRef.current?.focus({ preventScroll: true })
      rafId = null
    })
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [isOpen, searchable])

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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const firstOption = filteredOptions[0]
        if (firstOption) {
          handleSelect(firstOption.value)
        }
      } else if (e.key === 'Escape') {
        handleDismiss()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (filteredOptions.length > 0 && scrollContainerRef.current) {
          const firstOption = scrollContainerRef.current.querySelector('button')
          if (firstOption) {
            ;(firstOption as HTMLButtonElement).focus()
          }
        }
      }
    },
    [filteredOptions, handleDismiss, handleSelect]
  )

  return (
    <FormField label={label} hint={hint} error={error} className={cn('w-full', className)}>
      <div className={cn('relative', isOpen && 'z-10')} ref={containerRef}>
        <SelectTrigger
          isOpen={isOpen}
          disabled={disabled}
          error={error}
          displayPlaceholder={displayPlaceholder}
          displayValue={displayValue}
          value={value}
          listboxId={listboxId}
          onToggle={handleToggle}
        />

        <SelectDropdown
          isOpen={isOpen}
          withOverlay={withOverlay}
          portaled={effectivePortaled}
          anchorRef={containerRef}
          searchable={searchable}
          displayPlaceholder={displayPlaceholder}
          label={label}
          value={value}
          searchQuery={searchQuery}
          filteredOptions={filteredOptions}
          searchInputRef={searchInputRef}
          scrollContainerRef={scrollContainerRef}
          dropdownRef={dropdownRef}
          listboxId={listboxId}
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
