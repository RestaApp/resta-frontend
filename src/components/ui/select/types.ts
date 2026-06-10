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
  searchable?: boolean
  /** Рендер дропдауна в portal с fixed-позицией (drawer, footer). */
  portaled?: boolean
  /** Отступ снизу (например высота BottomNav) для автоскролла при открытии дропдауна */
  bottomOffsetPx?: number
}
