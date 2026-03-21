import type { TFunction } from 'i18next'
import type { ApiRole } from '@/types'

export type ProfileAchievement = {
  id: string
  emoji: string
  title: string
  value: string
}

export function buildProfileAchievements(params: {
  t: TFunction
  apiRole: ApiRole | null
  completedShifts: number
  activeApplications: number
  myShiftsCount: number
  appliedShiftsCount: number
  isProfileFilled: boolean
  infoPercent: number
  specializationsCount: number
}): ProfileAchievement[] {
  const {
    t,
    apiRole,
    completedShifts,
    activeApplications,
    myShiftsCount,
    appliedShiftsCount,
    isProfileFilled,
    infoPercent,
    specializationsCount,
  } = params

  const normalizedPercent = Math.max(0, Math.min(100, Math.round(infoPercent)))
  // Не показываем 100%, пока обязательные поля профиля не заполнены.
  const filledValue = `${isProfileFilled ? normalizedPercent : Math.min(normalizedPercent, 99)}%`

  if (apiRole === 'employee') {
    return [
      {
        id: 'employee.completed',
        emoji: '🏆',
        title: t('profile.completedShifts'),
        value: String(completedShifts),
      },
      {
        id: 'employee.active',
        emoji: '🎯',
        title: t('profile.activeApplications'),
        value: String(activeApplications),
      },
      { id: 'common.filled', emoji: '💎', title: t('common.filled'), value: filledValue },
      {
        id: 'employee.spec',
        emoji: '⭐',
        title: t('profile.specializationSection'),
        value: String(specializationsCount),
      },
    ]
  }

  if (apiRole === 'restaurant') {
    return [
      {
        id: 'restaurant.created',
        emoji: '🍽️',
        title: t('profile.shiftsCreated'),
        value: String(myShiftsCount),
      },
      {
        id: 'restaurant.requests',
        emoji: '📨',
        title: t('profile.activeRequests'),
        value: String(appliedShiftsCount),
      },
      { id: 'common.filled', emoji: '💎', title: t('common.filled'), value: filledValue },
      { id: 'common.stats', emoji: '⚡', title: t('profile.stats'), value: '—' },
    ]
  }

  if (apiRole === 'supplier') {
    return [
      { id: 'supplier.views', emoji: '📈', title: t('profile.views'), value: '—' },
      { id: 'supplier.clients', emoji: '🤝', title: t('profile.activeClients'), value: '—' },
      { id: 'common.filled', emoji: '💎', title: t('common.filled'), value: filledValue },
      { id: 'common.stats', emoji: '⚡', title: t('profile.stats'), value: '—' },
    ]
  }

  return []
}
