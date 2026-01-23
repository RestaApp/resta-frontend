import { memo, useMemo } from 'react'
import { Select, type SelectOption } from './select'

interface CitySelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export const CitySelect = memo(function CitySelect({
  value,
  onChange,
  options,
  placeholder = 'Выберите город',
  disabled = false,
  className,
}: CitySelectProps) {
  const selectOptions: SelectOption[] = useMemo(
    () => options.map((city) => ({ value: city, label: city })),
    [options]
  )

  return (
    <Select
      value={value}
      onChange={onChange}
      options={selectOptions}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  )
})
