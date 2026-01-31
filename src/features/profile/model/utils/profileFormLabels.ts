import type { ApiRole } from '@/types'

/** Подпись для поля «Описание» в зависимости от роли */
export function getBioLabelSuffix(apiRole: ApiRole | null): string {
  if (apiRole === 'restaurant') return 'о заведении'
  if (apiRole === 'supplier') return 'о компании'
  return 'о себе'
}

/** Подпись для блока work_experience_summary в карточке профиля */
export function getWorkSummaryLabel(apiRole: ApiRole | null): string {
  return apiRole === 'employee' ? 'Резюме' : 'Опыт работы'
}
