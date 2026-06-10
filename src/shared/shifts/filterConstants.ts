export type SalaryRangeId = '0-80' | '80-120' | '120-160' | '160+'

export type DateFilterPreset = 'today' | 'tomorrow' | 'week' | 'custom'

export interface SalaryRangeOption {
  id: SalaryRangeId
  min: number
  max?: number
}

export const SALARY_RANGE_OPTIONS: readonly SalaryRangeOption[] = [
  { id: '0-80', min: 0, max: 80 },
  { id: '80-120', min: 80, max: 120 },
  { id: '120-160', min: 120, max: 160 },
  { id: '160+', min: 160 },
] as const

export const DATE_FILTER_PRESETS: readonly DateFilterPreset[] = [
  'today',
  'tomorrow',
  'week',
  'custom',
] as const
