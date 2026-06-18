import { describe, expect, it } from 'vitest'
import { buildUpdateUserRequest, type ProfileFormData } from './buildUpdateUserRequest'

const baseForm = (overrides: Partial<ProfileFormData> = {}): ProfileFormData => ({
  name: 'Иван',
  lastName: 'Петров',
  bio: '',
  city: 'Минск',
  location: [],
  email: '',
  phone: '+375291234567',
  website: '',
  businessHours: '',
  position: 'chef',
  experienceYears: 3,
  openToWork: true,
  skills: 'нож, HACCP',
  specializations: ['sous_chef'],
  workHistory: [],
  restaurantFormat: '',
  cuisineTypes: [],
  supplierCategory: '',
  supplierTypes: [],
  deliveryAvailable: false,
  priceListUrl: '',
  ...overrides,
})

describe('buildUpdateUserRequest', () => {
  it('без изменений отдаёт пустой user', () => {
    const base = baseForm()
    expect(buildUpdateUserRequest(base, 'employee', base).user).toEqual({})
  })

  it('никогда не шлёт work_experience_summary (удалено на бэке)', () => {
    const base = baseForm()
    const changed = baseForm({ bio: 'новое' })
    const req = buildUpdateUserRequest(changed, 'employee', base)
    expect('work_experience_summary' in req.user).toBe(false)
  })

  it('employee: изменённые skills уходят и плоско, и в nested', () => {
    const base = baseForm()
    const req = buildUpdateUserRequest(baseForm({ skills: 'нож' }), 'employee', base).user
    expect(req.skills).toEqual(['нож'])
    expect(req.employee_profile_attributes?.skills).toEqual(['нож'])
  })

  it('employee: work_history санитизируется и шлётся целиком', () => {
    const base = baseForm()
    const changed = baseForm({
      workHistory: [
        {
          id: 'wh-1',
          company: 'Урюк',
          position: 'Су-шеф',
          startedAt: '2022-03',
          endedAt: '',
          isCurrent: true,
          city: '',
          description: '',
        },
      ],
    })
    const req = buildUpdateUserRequest(changed, 'employee', base).user
    expect(req.work_history).toEqual([
      { company: 'Урюк', position: 'Су-шеф', started_at: '2022-03' },
    ])
  })

  it('restaurant: cuisine_types шлётся, пустой restaurant_format — нет', () => {
    const base = baseForm({ restaurantFormat: '', cuisineTypes: [] })
    const req = buildUpdateUserRequest(
      baseForm({ restaurantFormat: '', cuisineTypes: ['italian'] }),
      'restaurant',
      base
    ).user
    expect(req.cuisine_types).toEqual(['italian'])
    expect(req.restaurant_format).toBeUndefined()
    expect(req.restaurant_profile_attributes?.cuisine_types).toEqual(['italian'])
  })

  it('supplier: delivery_available и price_list_url уходят nested', () => {
    const base = baseForm({ deliveryAvailable: false, priceListUrl: '' })
    const req = buildUpdateUserRequest(
      baseForm({ deliveryAvailable: true, priceListUrl: 'https://x.by/price.pdf' }),
      'supplier',
      base
    ).user
    expect(req.supplier_profile_attributes?.delivery_available).toBe(true)
    expect(req.supplier_profile_attributes?.price_list_url).toBe('https://x.by/price.pdf')
  })

  it('employee не шлёт бизнес-поля (website/location)', () => {
    const base = baseForm()
    const req = buildUpdateUserRequest(baseForm({ website: 'https://x.by' }), 'employee', base).user
    expect('website' in req).toBe(false)
  })
})
