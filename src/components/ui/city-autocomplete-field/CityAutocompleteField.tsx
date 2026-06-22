import { memo, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Loader } from '@/components/ui/loader'
import { SelectDropdown } from '@/components/ui/select/SelectDropdown'
import { useSelectDropdownShell } from '@/components/ui/select/useSelectDropdownShell'
import { useCityAutocomplete } from './useCityAutocomplete'

export interface CityAutocompleteFieldProps {
  value: string
  onChange: (value: string) => void
  options?: string[]
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  label?: string
  hint?: string
  error?: string
  validateOnBlur?: boolean
  /** Без обёртки FormField — когда лейбл снаружи. */
  embedded?: boolean
  onLocationRequest?: () => void
  showLocationButton?: boolean
  isLocationLoading?: boolean
  clearOnFocus?: boolean
  hideLabel?: boolean
  portaled?: boolean
  className?: string
}

export const CityAutocompleteField = memo(function CityAutocompleteField({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  isLoading = false,
  label,
  hint,
  error,
  validateOnBlur = true,
  embedded = false,
  onLocationRequest,
  showLocationButton = true,
  isLocationLoading = false,
  clearOnFocus = false,
  hideLabel = false,
  portaled = false,
  className,
}: CityAutocompleteFieldProps) {
  const { t } = useTranslation()
  const listboxId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const displayPlaceholder = placeholder ?? t('citySelect.placeholder')
  const resolvedLabel = hideLabel ? undefined : (label ?? t('profile.city'))

  const {
    isValid,
    errorMessage,
    isLoadingCities,
    showSuggestions,
    filteredCities,
    inputRef,
    containerRef,
    listRef,
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    handleCitySelect,
    handleDropdownClose,
  } = useCityAutocomplete({
    value,
    onChange,
    options,
    isLoadingOptions: isLoading,
    validateOnBlur,
    disabled,
  })

  const { dropdownRef, effectivePortaled } = useSelectDropdownShell({
    isOpen: showSuggestions,
    portaled,
    containerRef,
    onDismiss: handleDropdownClose,
    // Поле города открывает клавиатуру: автоскролл по scroll/resize сбрасывал бы
    // фокус и список «моргал». Позиционируем список без реакции на скролл.
    autoScrollIntoView: false,
  })

  const handleInputBlurWithGuard = (event: React.FocusEvent<HTMLInputElement>) => {
    const next = event.relatedTarget as Node | null
    if (next && (containerRef.current?.contains(next) || dropdownRef.current?.contains(next))) {
      return
    }
    handleInputBlur()
  }

  const cityOptions = filteredCities.map(city => ({ value: city, label: city }))
  const displayError = error ?? (!isValid ? (errorMessage ?? undefined) : undefined)

  const inputControl = (
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
        onBlur={handleInputBlurWithGuard}
        placeholder={displayPlaceholder}
        className={cn(showLocationButton && 'pr-12')}
        autoComplete="off"
        disabled={disabled}
        aria-invalid={displayError ? true : undefined}
        role="combobox"
        aria-expanded={showSuggestions}
        aria-controls={listboxId}
        aria-autocomplete="list"
      />
      {showLocationButton ? (
        <button
          type="button"
          onClick={onLocationRequest}
          disabled={disabled || isLocationLoading}
          className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 transition-colors hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={t('aria.determineLocation')}
        >
          {isLocationLoading ? (
            <Loader size="sm" />
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      ) : null}
    </div>
  )

  return (
    <div ref={containerRef} className={cn('relative', showSuggestions && 'z-10', className)}>
      {embedded ? (
        inputControl
      ) : (
        <FormField label={resolvedLabel} hint={hint} error={displayError}>
          {inputControl}
        </FormField>
      )}

      <SelectDropdown
        isOpen={showSuggestions}
        portaled={effectivePortaled}
        anchorRef={containerRef}
        isLoading={isLoadingCities}
        loadingContent={
          <div className="flex items-center justify-center gap-2 px-4 py-3">
            <Loader size="sm" />
          </div>
        }
        displayPlaceholder={displayPlaceholder}
        label={resolvedLabel}
        value={value}
        searchQuery=""
        filteredOptions={cityOptions}
        searchInputRef={searchInputRef}
        scrollContainerRef={listRef}
        dropdownRef={dropdownRef}
        listboxId={listboxId}
        onClose={handleDropdownClose}
        onChangeSearch={() => undefined}
        onKeyDown={() => undefined}
        onSelect={handleCitySelect}
        t={key => t(key)}
      />
    </div>
  )
})
