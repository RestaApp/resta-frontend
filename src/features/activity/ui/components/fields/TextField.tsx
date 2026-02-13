import { Input } from '@/components/ui/input'
import { Field } from './Field'

type TextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}

export const TextField = ({ label, value, onChange, placeholder, error }: TextFieldProps) => (
  <Field label={label} error={error}>
    <Input
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-invalid={!!error}
    />
  </Field>
)

export default TextField
