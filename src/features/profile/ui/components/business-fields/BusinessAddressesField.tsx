import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'

interface BusinessAddressesFieldProps {
  value: string[]
  disabled: boolean
  isRestaurant: boolean
  onChange: (next: string[]) => void
}

/**
 * Адреса бизнеса: одна или несколько строк (для ресторанов с филиалами).
 * Работает напрямую со string[] — без сериализации через `\n`.
 */
export const BusinessAddressesField = ({
  value,
  disabled,
  isRestaurant,
  onChange,
}: BusinessAddressesFieldProps) => {
  const { t } = useTranslation()
  const addresses = value.length > 0 ? value : ['']

  const updateAt = (index: number, nextValue: string) => {
    const next = [...addresses]
    next[index] = nextValue
    onChange(next)
  }

  const addLine = () => onChange([...addresses, ''])

  const removeAt = (index: number) => {
    const next = addresses.filter((_, itemIndex) => itemIndex !== index)
    onChange(next.length > 0 ? next : [''])
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
              defaultValue: 'Если у вас несколько точек, добавьте каждый адрес отдельно',
            })
          : undefined
      }
    >
      <div className="flex flex-col gap-2">
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
