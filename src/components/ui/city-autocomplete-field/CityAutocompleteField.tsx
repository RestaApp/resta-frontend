import { memo, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Loader } from '@/components/ui/loader'
import { SelectDropdown } from '@/components/ui/select/SelectDropdown'
import { useDropdownAutoScroll } from '@/components/ui/select/useDropdownAutoScroll'
import { BOTTOM_NAV_HEIGHT_PX } from '@/shared/ui/layout'
import { useCityAutocomplete } from './useCityAutocomplete'

interface CityAutocompleteFieldProps {
  value: string
  onChange: (value: string) => void
  onLocationRequest: () => void
  showLocationButton?: boolean
  isLoading?: boolean
  clearOnFocus?: boolean
  hideLabel?: boolean
}

export const CityAutocompleteField = memo(function CityAutocompleteField({
  value,
  onChange,
  onLocationRequest,
  showLocationButton = true,
  isLoading = false,
  clearOnFocus = false,
  hideLabel = false,
}: CityAutocompleteFieldProps) {
  const { t } = useTranslation()
  const listboxId = useId()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const {
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
  } = useCityAutocomplete({
    value,
    onChange,
  })

  useDropdownAutoScroll({
    isOpen: hasSuggestions,
    containerRef,
    bottomOffsetPx: BOTTOM_NAV_HEIGHT_PX,
  })

  const cityOptions = filteredCities.map(city => ({ value: city, label: city }))

  return (
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
        portaled
        anchorRef={containerRef}
        isLoading={isLoadingCities}
        loadingContent={
          <div className="flex items-center justify-center gap-2 px-4 py-3">
            <Loader size="sm" />
          </div>
        }
        footerContent={null}
        searchable={false}
        displayPlaceholder={t('citySelect.placeholder')}
        value={value}
        searchQuery=""
        filteredOptions={cityOptions}
        searchInputRef={inputRef}
        scrollContainerRef={listRef}
        dropdownRef={dropdownRef}
        listboxId={listboxId}
        onClose={handleInputBlur}
        onChangeSearch={() => undefined}
        onKeyDown={() => undefined}
        onSelect={handleCitySelect}
        t={key => t(key)}
      />
    </div>
  )
})
