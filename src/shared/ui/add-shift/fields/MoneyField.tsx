import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { BynIcon } from '@/components/ui/byn-icon'
import { formatMoney, parseMoneyInput } from '@/shared/shifts/formatting'
import { Field } from './Field'

type MoneyFieldProps = {
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  placeholder?: string
}

export const MoneyField = ({ value, onChange, error, label, placeholder }: MoneyFieldProps) => {
  const { t } = useTranslation()

  // Во время ввода НЕ форматируем: живой formatMoney вставлял разделители тысяч
  // (каретка прыгала на суммах ≥1000) и applied toFixed(2), из-за чего нельзя было
  // набрать дробную часть (точка стиралась на каждой клавише). Здесь только
  // отсекаем заведомо неверные символы, сохраняя цифры/разделители. Красивый вид
  // наводим на blur; submit и валидация всё равно повторно парсят через
  // parseMoneyInput, поэтому «сырой» промежуточный формат безопасен.
  const handleChange = (rawValue: string) => {
    onChange(rawValue.replace(/[^\d.,\s]/g, ''))
  }

  const handleBlur = () => {
    if (!value.trim()) {
      onChange('')
      return
    }
    const parsed = parseMoneyInput(value)
    onChange(parsed === null ? '' : formatMoney(parsed))
  }

  return (
    <Field label={label ?? t('shift.pay')} error={error}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
          <BynIcon className="h-4 w-4 text-muted-foreground" />
        </span>
        <Input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder ?? t('shift.payPlaceholder')}
          className="pl-8"
          aria-invalid={!!error}
        />
      </div>
    </Field>
  )
}
