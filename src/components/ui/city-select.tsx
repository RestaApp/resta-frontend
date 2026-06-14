import { memo } from 'react'
import { CityAutocompleteField } from './city-autocomplete-field/CityAutocompleteField'

interface CitySelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  className?: string
  label?: string
  hint?: string
  error?: string
  validateOnBlur?: boolean
  embedded?: boolean
}

/** Выбор города с поиском прямо в поле (combobox). */
export const CitySelect = memo(function CitySelect({
  validateOnBlur = true,
  ...props
}: CitySelectProps) {
  return (
    <CityAutocompleteField {...props} showLocationButton={false} validateOnBlur={validateOnBlur} />
  )
})
