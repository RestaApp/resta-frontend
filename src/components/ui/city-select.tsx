import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
  placeholder,
  disabled = false,
  className,
}: CitySelectProps) {
  const { t } = useTranslation()
  const displayPlaceholder = placeholder ?? t('citySelect.placeholder')
  const selectOptions: SelectOption[] = useMemo(
    () => options.map((city) => ({ value: city, label: city })),
    [options]
  )

  return (
    <Select
      value={value}
      onChange={onChange}
      options={selectOptions}
      placeholder={displayPlaceholder}
      disabled={disabled}
      className={className}
    />
  )
})
