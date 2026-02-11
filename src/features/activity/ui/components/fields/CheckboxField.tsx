import { Switch } from '@/components/ui/switch'

type CheckboxFieldProps = {
  id: string
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}

export const CheckboxField = ({ id, label, checked, onChange }: CheckboxFieldProps) => (
  <div className="flex items-center justify-between">
    <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
      {label}
    </label>
    <Switch checked={checked} onCheckedChange={onChange} ariaLabel={label} />
  </div>
)

export default CheckboxField
