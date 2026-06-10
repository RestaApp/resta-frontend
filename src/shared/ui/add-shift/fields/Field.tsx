import { FormField } from '@/components/ui/form-field'

type FieldProps = {
  label: string
  hint?: string
  hintPlacement?: 'label' | 'below'
  error?: string
  children: React.ReactNode
}

export const Field = ({ label, hint, hintPlacement, error, children }: FieldProps) => {
  return (
    <FormField label={label} hint={hint} hintPlacement={hintPlacement} error={error}>
      {children}
    </FormField>
  )
}
