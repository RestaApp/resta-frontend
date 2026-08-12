import { describe, expect, it } from 'vitest'
import ru from './locales/ru.json'
import en from './locales/en.json'

describe('тексты доступа сотрудника к контактам заведения', () => {
  it('не обещает открыть уже доступные контакты после принятия отклика', () => {
    expect(ru.feed.applicationSentSuccess).not.toContain('доступ к контактам')
    expect(ru.shift.applyPrivacyDescription).toBe('Контакты заведения доступны в его профиле.')
    expect(ru.onboarding.complete.employee.features.chat).toContain('доступны сразу')

    expect(en.feed.applicationSentSuccess).not.toContain('access to contacts')
    expect(en.shift.applyPrivacyDescription).toContain('available')
  })

  it('сохраняет различие политик для сотрудника и заведения', () => {
    expect(ru.help.accept.body).toContain('Контакты заведения доступны сотруднику всегда')
    expect(ru.help.accept.body).toContain('заведению открываются контакты сотрудника')
  })
})
