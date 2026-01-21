import { Input } from '@/components/ui/input'
import { Field } from './Field'

type TextFieldProps = {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export const TextField = ({ label, value, onChange, placeholder }: TextFieldProps) => (
    <Field label={label}>
        <Input
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </Field>
)

export default TextField


