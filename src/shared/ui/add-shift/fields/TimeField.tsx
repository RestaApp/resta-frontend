import { TimeInput } from '@/components/ui/time-input'
import { Field } from './Field'

type TimeFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export const TimeField = ({ label, value, onChange, error, disabled = false }: TimeFieldProps) => {
  return (
    <Field label={label} error={error}>
      <TimeInput value={value} onChange={onChange} disabled={disabled} ariaLabel={label} />
    </Field>
  )
}
