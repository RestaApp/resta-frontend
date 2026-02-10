import type { LucideIcon } from 'lucide-react'
import { SectionHeader } from './section-header'

export interface SectionHeaderWithIconProps {
  icon: LucideIcon
  title: string
  count?: number
}

/** @deprecated Используйте <SectionHeader icon={Icon} title={...} count={...} /> */
export function SectionHeaderWithIcon({ icon, title, count }: SectionHeaderWithIconProps) {
  return <SectionHeader icon={icon} title={title} count={count} />
}
