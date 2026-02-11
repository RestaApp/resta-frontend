import { Field } from './Field'
import { SELECT_BASE_CLASS } from './constants'
import { ChevronDown } from 'lucide-react'

type SelectFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectFieldOption[]
  placeholder?: string
  disabled?: boolean
  hint?: string
  className?: string
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
}: SelectFieldProps) => (
  <Field label={label} hint={hint}>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`${SELECT_BASE_CLASS} ${disabled ? 'opacity-60' : ''} ${className ?? ''}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        <ChevronDown className="w-4 h-4" />
      </span>
    </div>
  </Field>
)

export default SelectField
