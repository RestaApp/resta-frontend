import type { ShiftType } from '@/features/activity/model/hooks/useAddShiftForm'

export type DrawerCopy = {
  drawerTitle: string
  drawerDescription: string
  titleLabel: string
  titlePlaceholder: string
  payLabel: string
  payPlaceholder: string
}

export const INITIAL_SHIFT_TYPE: ShiftType = 'vacancy'
export const TOTAL_STEPS = 3 as const

export const getLockedShiftType = (role?: string | null): ShiftType | null => {
  if (role === 'employee') return 'replacement'
  return null
}

export const getDrawerCopy = (
  isVacancyType: boolean,
  t: (key: string, options?: Record<string, unknown>) => string
): DrawerCopy => {
  if (isVacancyType) {
    return {
      drawerTitle: t('shift.addVacancyTitle', { defaultValue: 'Создать вакансию' }),
      drawerDescription: t('shift.addVacancyDescription', {
        defaultValue: 'Опишите вакансию, чтобы получить отклики подходящих кандидатов.',
      }),
      titleLabel: t('shift.vacancyTitleLabel', { defaultValue: 'Название вакансии' }),
      titlePlaceholder: t('shift.vacancyTitlePlaceholder', {
        defaultValue: 'Например: Официант в вечернюю смену',
      }),
      payLabel: t('shift.payMonthLabel', { defaultValue: 'Оплата в месяц' }),
      payPlaceholder: t('shift.payMonthPlaceholder', { defaultValue: 'Сколько платят в месяц?' }),
    }
  }

  return {
    drawerTitle: t('shift.addReplacementTitle', { defaultValue: 'Создать смену' }),
    drawerDescription: t('shift.addReplacementDescription', {
      defaultValue: 'Опишите смену, чтобы быстро найти замену.',
    }),
    titleLabel: t('shift.shiftTitle', { defaultValue: 'Название смены' }),
    titlePlaceholder: t('shift.shiftTitlePlaceholder'),
    payLabel: t('shift.pay'),
    payPlaceholder: t('shift.payPlaceholder'),
  }
}
