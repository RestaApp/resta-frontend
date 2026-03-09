export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  label?: string
  hint?: string
  error?: string
  allowCustomValue?: boolean
  searchable?: boolean
  forceDropdownBelow?: boolean
  /** Отступ снизу (например высота BottomNav) для расчёта позиции дропдауна */
  bottomOffsetPx?: number
}
