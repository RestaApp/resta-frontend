import type { ReactNode } from 'react'
import { Switch } from '@/components/ui/switch'
import { SHIFT_CARD_TITLE_CLASS } from '@/components/ui/shift-card/shift-card-styles'

type CheckboxFieldProps = {
  id: string
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  /** Доп. слот рядом с подписью — например «?»-хинт. */
  labelHint?: ReactNode
}

export const CheckboxField = ({ id, label, checked, onChange, labelHint }: CheckboxFieldProps) => (
  <div className="flex items-center justify-between">
    <span className="flex items-center gap-1.5">
      <label htmlFor={id} className={SHIFT_CARD_TITLE_CLASS}>
        {label}
      </label>
      {labelHint}
    </span>
    <Switch checked={checked} onCheckedChange={onChange} ariaLabel={label} />
  </div>
)
