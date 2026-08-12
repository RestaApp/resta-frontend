import { describe, expect, it } from 'vitest'
import ru from './locales/ru.json'
import en from './locales/en.json'

describe('универсальные действия вакансий и смен', () => {
  it('не называет отклик и принятие действиями только со сменой', () => {
    expect(ru.shift.applyForThisShift).toBe('Откликнуться')
    expect(ru.shift.acceptApplication).toBe('Принять')
    expect(ru.shift.hireShort).toBe('Принять')
    expect(en.shift.applyForThisShift).toBe('Apply')
    expect(en.shift.acceptApplication).toBe('Accept')
  })

  it('использует нейтральные тексты в общих состояниях', () => {
    expect(ru.shift.noApplicantsDescription).not.toContain('смен')
    expect(ru.shift.rejectApplicationConfirmDescription).not.toContain('смен')
    expect(ru.venueUi.staff.acceptClosedError).not.toContain('Смена')
    expect(ru.profile.notifications.applications).toBe('Отклики')
    expect(ru.profile.notifications.sections.shifts).toBe('Вакансии и смены')
    expect(ru.shift.deleteConfirmTitle).toBe('Удалить объявление?')
    expect(ru.shift.createdConfirmation).toContain('Активность')
  })
})
