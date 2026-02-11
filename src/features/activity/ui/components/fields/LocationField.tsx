import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CitySelect } from '@/components/ui/city-select'
import { Input } from '@/components/ui/input'
import { Field } from './Field'
import { useCities } from '@/hooks/useCities'
import { cn } from '@/utils/cn'

interface LocationFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

// Парсит строку локации на город и адрес
const parseLocation = (location: string): { city: string; address: string } => {
  if (!location.trim()) return { city: '', address: '' }

  // Ищем запятую как разделитель
  const commaIndex = location.indexOf(',')
  if (commaIndex === -1) {
    // Если запятой нет, считаем всю строку адресом
    return { city: '', address: location.trim() }
  }

  const city = location.substring(0, commaIndex).trim()
  const address = location.substring(commaIndex + 1).trim()
  return { city, address }
}

// Объединяет город и адрес в строку локации
const combineLocation = (city: string, address: string): string => {
  if (!city && !address) return ''
  if (!city) return address
  if (!address) return city
  return `${city}, ${address}`
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
