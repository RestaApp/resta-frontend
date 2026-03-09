import { Field } from './Field'
import { Textarea } from '@/components/ui/textarea'

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
    <Textarea
      value={value}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      style={minHeight ? { minHeight } : undefined}
      aria-invalid={!!error}
    />
  </Field>
)

export default TextAreaField
