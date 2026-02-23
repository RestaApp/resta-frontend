import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Field } from './Field'

type MoneyFieldProps = {
  value: string
  onChange: (value: string) => void
  error?: string
}

export const MoneyField = ({ value, onChange, error }: MoneyFieldProps) => {
  const { t } = useTranslation()
  return (
    <Field label={t('shift.pay')} error={error}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
          BYN
        </span>
        <Input
          type="number"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={t('shift.payPlaceholder')}
          className="pl-14"
          aria-invalid={!!error}
        />
      </div>
    </Field>
  )
}

export default MoneyField
