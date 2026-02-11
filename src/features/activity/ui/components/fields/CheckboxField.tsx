type CheckboxFieldProps = {
  id: string
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}

export const CheckboxField = ({ id, label, checked, onChange }: CheckboxFieldProps) => (
  <div className="flex items-center gap-3">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
    />
    <label htmlFor={id} className="text-sm text-muted-foreground">
      {label}
    </label>
  </div>
)

export default CheckboxField
