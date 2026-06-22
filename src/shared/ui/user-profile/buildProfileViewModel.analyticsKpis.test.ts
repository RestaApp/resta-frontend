import { describe, it, expect } from 'vitest'
import type { TFunction } from 'i18next'
import type { UserData } from '@/services/api/authApi'
import { buildProfileViewModel } from './buildProfileViewModel'

const t = ((key: string) => key) as unknown as TFunction

const userProfile = {
  id: 7,
  role: 'employee',
  average_rating: 0,
  total_reviews: 0,
  employee_profile: null,
} as unknown as UserData

const baseParams = {
  t,
  userProfile,
  apiRole: 'employee' as const,
  userName: 'Иван',
  roleLabel: 'Сотрудник',
  completeness: null,
  completedShifts: 0,
  myShiftsCount: 0,
  getSpecializationLabel: (v: string) => v,
  getSupplierTypeLabel: (v: string) => v,
  getRestaurantFormatLabel: (v: string) => v,
  getCuisineTypeLabel: (v: string) => v,
}

describe('buildProfileViewModel — analyticsKpis', () => {
  it('пусто, когда метрики analytics/my не переданы', () => {
    const vm = buildProfileViewModel(baseParams)
    expect(vm.analyticsKpis).toEqual([])
  })

  it('строит два KPI (просмотры/клики) при наличии данных', () => {
    const vm = buildProfileViewModel({
      ...baseParams,
      profileViewsThisMonth: 15,
      contactClicksThisMonth: 4,
    })
    expect(vm.analyticsKpis.map(k => k.id)).toEqual(['profile-views', 'contact-clicks'])
    expect(vm.analyticsKpis[0]?.value).toBe(15)
    expect(vm.analyticsKpis[1]?.value).toBe(4)
  })

  it('показывает «—» для нулевых/отсутствующих значений, но строит ряд если хотя бы одно задано', () => {
    const vm = buildProfileViewModel({
      ...baseParams,
      profileViewsThisMonth: 0,
      contactClicksThisMonth: null,
    })
    expect(vm.analyticsKpis).toHaveLength(2)
    expect(vm.analyticsKpis[0]?.value).toBe(0)
    expect(vm.analyticsKpis[1]?.value).toBe('—')
  })

  it('не строит ряд при hideMetrics', () => {
    const vm = buildProfileViewModel({
      ...baseParams,
      hideMetrics: true,
      profileViewsThisMonth: 15,
      contactClicksThisMonth: 4,
    })
    expect(vm.analyticsKpis).toEqual([])
  })
})
