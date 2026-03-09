import { FormField } from '@/components/ui/form-field'

type FieldProps = {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}

export const Field = ({ label, hint, error, children }: FieldProps) => {
  return (
    <FormField label={label} hint={hint} error={error}>
      {children}
    </FormField>
  )
}

export default Field
