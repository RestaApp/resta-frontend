/** Диапазоны посменной оплаты (смены/замены). */
export type ShiftSalaryRangeId = '0-80' | '80-120' | '120-160' | '160+'
/** Диапазоны месячной оплаты (вакансии). */
export type VacancySalaryRangeId = '0-1000' | '1000-1500' | '1500-2500' | '2500+'
export type SalaryRangeId = ShiftSalaryRangeId | VacancySalaryRangeId

export type DateFilterPreset = 'today' | 'tomorrow' | 'week' | 'custom'

export interface SalaryRangeOption {
  id: SalaryRangeId
  min: number
  max?: number
}

/** Посменная ставка (BYN за смену). */
export const SALARY_RANGE_OPTIONS: readonly SalaryRangeOption[] = [
  { id: '0-80', min: 0, max: 80 },
  { id: '80-120', min: 80, max: 120 },
  { id: '120-160', min: 120, max: 160 },
  { id: '160+', min: 160 },
] as const

/** Месячная ставка для вакансий (BYN/мес). Пороги — продуктовые, можно скорректировать. */
export const VACANCY_SALARY_RANGE_OPTIONS: readonly SalaryRangeOption[] = [
  { id: '0-1000', min: 0, max: 1000 },
  { id: '1000-1500', min: 1000, max: 1500 },
  { id: '1500-2500', min: 1500, max: 2500 },
  { id: '2500+', min: 2500 },
] as const

/** Все варианты — для резолва id → min/max независимо от типа. */
export const ALL_SALARY_RANGE_OPTIONS: readonly SalaryRangeOption[] = [
  ...SALARY_RANGE_OPTIONS,
  ...VACANCY_SALARY_RANGE_OPTIONS,
] as const

/** Набор диапазонов под тип ленты: вакансии — месячные, смены/замены — посменные. */
export const getSalaryRangeOptions = (isVacancy: boolean): readonly SalaryRangeOption[] =>
  isVacancy ? VACANCY_SALARY_RANGE_OPTIONS : SALARY_RANGE_OPTIONS

export const DATE_FILTER_PRESETS: readonly DateFilterPreset[] = [
  'today',
  'tomorrow',
  'week',
  'custom',
] as const
