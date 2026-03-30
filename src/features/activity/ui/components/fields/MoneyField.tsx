import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { BynIcon } from '@/components/ui/byn-icon'
import { formatMoney, parseMoneyInput } from '@/features/feed/model/utils/formatting'
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

  const handleChange = (rawValue: string) => {
    if (!rawValue.trim()) {
      onChange('')
      return
    }
    const parsed = parseMoneyInput(rawValue)
    if (parsed === null) return
    onChange(formatMoney(parsed))
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
          placeholder={placeholder ?? t('shift.payPlaceholder')}
          className="pl-8"
          aria-invalid={!!error}
        />
      </div>
    </Field>
  )
}
