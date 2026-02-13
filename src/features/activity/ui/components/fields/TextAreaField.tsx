import { Field } from './Field'
import { TEXTAREA_BASE_CLASS } from './constants'

type TextAreaFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  error?: string
}

export const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder,
  minHeight,
  error,
}: TextAreaFieldProps) => (
  <Field label={label} error={error}>
    <textarea
      value={value}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      className={TEXTAREA_BASE_CLASS}
      style={minHeight ? { minHeight } : undefined}
      aria-invalid={!!error}
    />
  </Field>
)

export default TextAreaField
