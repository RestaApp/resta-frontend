import { Field } from './Field'
import { Select, type SelectOption } from '@/components/ui/select'

type SelectFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectFieldOption[]
  placeholder?: string
  disabled?: boolean
  hint?: string
  className?: string
  error?: string
}
type SelectFieldOption = {
  value: string
  label: string
}

export const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  hint,
  className,
  error,
}: SelectFieldProps) => (
  <Field label={label} hint={hint} error={error}>
    <Select
      value={value}
      onChange={onChange}
      options={options.map<SelectOption>(o => ({ value: o.value, label: o.label }))}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      error={error}
    />
  </Field>
)

export default SelectField
