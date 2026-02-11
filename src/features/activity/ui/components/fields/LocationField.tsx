import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CitySelect } from '@/components/ui/city-select'
import { Input } from '@/components/ui/input'
import { Field } from './Field'
import { useCities } from '@/hooks/useCities'
import { cn } from '@/utils/cn'
import { parseLocation, combineLocation } from '@/shared/utils/location'

interface LocationFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const LocationField = memo(function LocationField({
  label,
  value,
  onChange,
  placeholder,
}: LocationFieldProps) {
  const { t } = useTranslation()
  const { cities, isLoading: isCitiesLoading } = useCities({ enabled: true })
  const displayPlaceholder = placeholder ?? t('shift.locationPlaceholder')

  // Улучшенный парсинг: если значение без запятой совпадает с городом - считаем его городом
  const parsedLocation = useMemo(() => {
    const parsed = parseLocation(value)
    // Если город пустой, но адрес есть и совпадает с одним из городов - перемещаем в город
    if (!parsed.city && parsed.address && cities.length > 0) {
      const isCity = cities.some(c => c.toLowerCase() === parsed.address.toLowerCase())
      if (isCity) {
        return { city: parsed.address, address: '' }
      }
    }
    return parsed
  }, [value, cities])

  const city = parsedLocation.city
  const address = parsedLocation.address

  // Объединяем город и адрес при изменении
  const handleCityChange = (newCity: string) => {
    // Если адрес совпадает со старым городом или пустой - очищаем его
    let newAddress = address
    if (address === city || !address.trim()) {
      newAddress = ''
    }

    const combined = combineLocation(newCity, newAddress)
    onChange(combined)
  }

  const handleAddressChange = (newAddress: string) => {
    const combined = combineLocation(city, newAddress)
    onChange(combined)
  }

  return (
    <Field label={label}>
      <div className={cn('flex gap-2 items-stretch')}>
        <div className="flex-shrink-0 w-[180px] sm:w-[140px]">
          <CitySelect
            value={city}
            onChange={handleCityChange}
            options={cities}
            placeholder={t('profile.city')}
            disabled={isCitiesLoading}
          />
        </div>
        <div className="flex-1 min-w-0">
          <Input
            value={address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleAddressChange(e.target.value)
            }
            placeholder={displayPlaceholder}
          />
        </div>
      </div>
    </Field>
  )
})

export default LocationField
