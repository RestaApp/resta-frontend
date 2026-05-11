import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { parseAddresses, serializeAddresses } from '@/features/profile/model/utils/businessFields'

interface BusinessAddressesFieldProps {
  value: string
  disabled: boolean
  isRestaurant: boolean
  onChange: (next: string) => void
}

/**
 * Адреса бизнеса: одна или несколько строк (для ресторанов с филиалами).
 * Сохраняет исходный сериализованный формат через `serializeAddresses`.
 */
export const BusinessAddressesField = ({
  value,
  disabled,
  isRestaurant,
  onChange,
}: BusinessAddressesFieldProps) => {
  const { t } = useTranslation()
  const addresses = useMemo(() => parseAddresses(value), [value])

  const updateAt = (index: number, nextValue: string) => {
    const next = [...addresses]
    next[index] = nextValue
    onChange(serializeAddresses(next))
  }

  const addLine = () => onChange(serializeAddresses([...addresses, '']))

  const removeAt = (index: number) => {
    const next = addresses.filter((_, itemIndex) => itemIndex !== index)
    onChange(serializeAddresses(next))
  }

  return (
    <FormField
      label={
        isRestaurant
          ? t('profile.addresses', { defaultValue: 'Адрес(а) заведения' })
          : t('profileFields.address', { defaultValue: 'Адрес' })
      }
      hint={
        isRestaurant
          ? t('profile.addressesHint', {
              defaultValue: 'Если у вас несколько точек, укажите каждый адрес с новой строки',
            })
          : undefined
      }
    >
      <div className="space-y-2">
        {addresses.map((address, index) => (
          <div key={`address-${index}`} className="flex items-center gap-2">
            <Input
              value={address}
              onChange={e => updateAt(index, e.target.value)}
              placeholder={t('profile.form.singleAddressPlaceholder', {
                defaultValue: 'Город, улица, дом',
              })}
              disabled={disabled}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || addresses.length <= 1}
              onClick={() => removeAt(index)}
            >
              {t('common.remove', { defaultValue: 'Удалить' })}
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addLine}>
          {t('profile.addAddress', { defaultValue: 'Добавить адрес' })}
        </Button>
      </div>
    </FormField>
  )
}
