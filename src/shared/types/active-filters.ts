import type { LucideIcon } from 'lucide-react'

export type ActiveFilterVariant = 'primary' | 'default'

export interface ActiveFilterItem {
  id: string
  label: string
  icon?: LucideIcon
  variant?: ActiveFilterVariant
}
