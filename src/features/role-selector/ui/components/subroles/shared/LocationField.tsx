/**
 * Поле выбора города с автодополнением
 */

import { memo, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Loader } from '@/components/ui/loader'
import { SelectDropdown } from '@/components/ui/select/SelectDropdown'
import { BOTTOM_NAV_HEIGHT_PX } from '@/shared/ui/layout'
import { useLocationField } from '../../../../model/useLocationField'
interface LocationFieldProps {
  value: string
  onChange: (value: string) => void
  onLocationRequest: () => void
  showLocationButton?: boolean
  isLoading?: boolean
  /** Очищать поле при фокусе (например, в фильтрах) */
  clearOnFocus?: boolean
  /** Не показывать подпись (заголовок задаётся снаружи, напр. в фильтрах) */
  hideLabel?: boolean
}

export const LocationField = memo(function LocationField({
  value,
  onChange,
  onLocationRequest,
  showLocationButton = true,
  isLoading = false,
  clearOnFocus = false,
  hideLabel = false,
}: LocationFieldProps) {
  const { t } = useTranslation()
  const {
    isValid,
    errorMessage,
    isLoadingCities,
    hasSuggestions,
    hasMore,
    filteredCities,
    inputRef,
    containerRef,
    listRef,
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    handleCitySelect,
  } = useLocationField({
    value,
    onChange,
  })
  const didAutoScrollRef = useRef(false)
  const [maxDropdownHeight, setMaxDropdownHeight] = useState(200)

  useEffect(() => {
    if (!hasSuggestions || !containerRef.current) return

    const updateMaxHeight = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const scrollContainer = containerRef.current.closest('[data-scroll-container="true"]')
      const scrollContainerRect = scrollContainer?.getBoundingClientRect()
      const viewportBottom = scrollContainerRect?.bottom ?? window.innerHeight
      const effectiveBottomOffset = scrollContainerRect ? 0 : BOTTOM_NAV_HEIGHT_PX
      const spaceBelow = viewportBottom - rect.bottom - effectiveBottomOffset
      const desiredDropdownHeight = 260 // ~5-6 опций

      if (scrollContainer instanceof HTMLElement && !didAutoScrollRef.current) {
        const deficit = desiredDropdownHeight - spaceBelow
        if (deficit > 0) {
          const remainingScroll =
            scrollContainer.scrollHeight - scrollContainer.clientHeight - scrollContainer.scrollTop
          const scrollDelta = Math.min(deficit + 24, Math.max(remainingScroll, 0))
          if (scrollDelta > 0) {
            didAutoScrollRef.current = true
            scrollContainer.scrollBy({ top: scrollDelta, behavior: 'auto' })
          }
        }
      }

      setMaxDropdownHeight(Math.max(Math.min(spaceBelow - 12, 420), 64))
    }

    updateMaxHeight()
    window.addEventListener('resize', updateMaxHeight)
    window.addEventListener('scroll', updateMaxHeight, true)

    return () => {
      window.removeEventListener('resize', updateMaxHeight)
      window.removeEventListener('scroll', updateMaxHeight, true)
    }
  }, [hasSuggestions, containerRef])

  useEffect(() => {
    if (!hasSuggestions) {
      didAutoScrollRef.current = false
    }
  }, [hasSuggestions])

  const cityOptions = filteredCities.map(city => ({ value: city, label: city }))

  const content = (
    <div ref={containerRef} className="relative">
      <FormField
        label={hideLabel ? undefined : t('profile.city')}
        error={!isValid ? (errorMessage ?? undefined) : undefined}
      >
        <div className="relative">
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onFocus={() => {
              if (clearOnFocus && value) {
                onChange('')
              }
              handleInputFocus()
            }}
            onBlur={handleInputBlur}
            placeholder={t('citySelect.placeholder')}
            className="pr-12"
            autoComplete="off"
            aria-invalid={!isValid}
          />
          {showLocationButton ? (
            <button
              onClick={onLocationRequest}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-secondary/50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('aria.determineLocation')}
              type="button"
            >
              {isLoading ? (
                <Loader size="sm" />
              ) : (
                <MapPin className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ) : null}
        </div>
      </FormField>

      <SelectDropdown
        isOpen={hasSuggestions}
        withOverlay={false}
        isLoading={isLoadingCities}
        loadingContent={
          <div className="flex items-center justify-center gap-2 px-4 py-3">
            <Loader size="sm" />
          </div>
        }
        footerContent={
          hasMore ? (
            <div className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
              {t('citySelect.loadMoreHint')}
            </div>
          ) : null
        }
        searchable={false}
        displayPlaceholder={t('citySelect.placeholder')}
        value={value}
        searchQuery=""
        filteredOptions={cityOptions}
        maxHeight={maxDropdownHeight}
        dropdownPosition={{ left: 0, top: 0, width: 0, opensUp: false }}
        needsScroll={false}
        isScrolledToBottom
        searchInputRef={inputRef}
        scrollContainerRef={listRef}
        dropdownRef={containerRef}
        onClose={handleInputBlur}
        onChangeSearch={() => undefined}
        onKeyDown={() => undefined}
        onSelect={handleCitySelect}
        t={key => t(key)}
      />
    </div>
  )

  return content
})
