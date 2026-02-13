import { DollarSign } from 'lucide-react'
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
        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="number"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={t('shift.payPlaceholder')}
          className="pl-11"
          aria-invalid={!!error}
        />
      </div>
    </Field>
  )
}

export default MoneyField
