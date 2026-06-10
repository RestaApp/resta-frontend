import { Switch } from '@/components/ui/switch'
import { SHIFT_CARD_TITLE_CLASS } from '@/components/ui/shift-card/shift-card-styles'

type CheckboxFieldProps = {
  id: string
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}

export const CheckboxField = ({ id, label, checked, onChange }: CheckboxFieldProps) => (
  <div className="flex items-center justify-between">
    <label htmlFor={id} className={SHIFT_CARD_TITLE_CLASS}>
      {label}
    </label>
    <Switch checked={checked} onCheckedChange={onChange} ariaLabel={label} />
  </div>
)
