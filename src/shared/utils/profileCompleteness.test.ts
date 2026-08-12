import { describe, expect, it } from 'vitest'
import { getProfileCompleteness } from './profileCompleteness'

describe('getProfileCompleteness', () => {
  it('не блокирует отклик сотрудника без фамилии', () => {
    const result = getProfileCompleteness(
      {
        name: 'Иван',
        last_name: '',
        phone: '+375291234567',
        city: 'Минск',
      },
      'employee'
    )

    expect(result.isActionReady).toBe(true)
    expect(result.missing).toEqual([])
    expect(result.completionPercent).toBeLessThan(100)
  })

  it('считает для отклика обязательными только телефон и город', () => {
    const result = getProfileCompleteness({ name: 'Иван' }, 'employee')

    expect(result.isActionReady).toBe(false)
    expect(result.missing).toEqual(['phone', 'city'])
  })

  it('выводит 100% для полностью заполненного профиля сотрудника', () => {
    const result = getProfileCompleteness(
      {
        name: 'Иван',
        last_name: 'Петров',
        phone: '+375291234567',
        city: 'Минск',
        profile_photo_url: 'https://example.com/photo.jpg',
        bio: 'О себе',
        email: 'ivan@example.com',
        employee_profile: {
          position: 'chef',
          specializations: ['sushi_chef'],
          skills: ['HACCP'],
        },
        work_history: [{}],
      },
      'employee'
    )

    expect(result.completionPercent).toBe(100)
  })
})
