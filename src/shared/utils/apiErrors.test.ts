import type { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'
import { normalizeApiError } from './apiErrors'

// Простой мок i18next: возвращает ключ (или подставляет fields для profileIncomplete).
const t = ((key: string, opts?: { fields?: string }) =>
  key === 'errors.profileIncomplete' ? `incomplete:${opts?.fields}` : key) as unknown as TFunction

const fallback = 'fallback'

describe('normalizeApiError · контракт ошибок (code-based)', () => {
  it('распознаёт profile_incomplete по code и маппит missing_fields', () => {
    const result = normalizeApiError(
      { data: { code: 'profile_incomplete', missing_fields: ['phone', 'city'] } },
      fallback,
      t
    )

    expect(result.kind).toBe('profile_incomplete')
    if (result.kind === 'profile_incomplete') {
      expect(result.missingFields).toEqual(['phone', 'city'])
      expect(result.missingFieldsLabels).toEqual(['profileFields.phone', 'profileFields.city'])
    }
  })

  it('старый message: "profile_incomplete" больше НЕ спецслучай (бэк перешёл на code)', () => {
    const result = normalizeApiError({ data: { message: 'profile_incomplete' } }, fallback, t)
    expect(result.kind).toBe('generic')
  })

  it('generic-ошибка берёт текст из errors[0]', () => {
    const result = normalizeApiError({ data: { errors: ['Position is invalid', 'x'] } }, fallback, t)
    expect(result).toEqual({ kind: 'generic', message: 'Position is invalid' })
  })

  it('generic-ошибка берёт одиночный error (монетизация) при отсутствии errors[]', () => {
    const result = normalizeApiError({ data: { error: 'Purchase required' } }, fallback, t)
    expect(result).toEqual({ kind: 'generic', message: 'Purchase required' })
  })

  it('пустое тело → fallback', () => {
    expect(normalizeApiError({ data: {} }, fallback, t)).toEqual({ kind: 'generic', message: fallback })
  })

  it('уже нормализованная ошибка возвращается как есть', () => {
    const already = { kind: 'generic', message: 'm' } as const
    expect(normalizeApiError(already, fallback, t)).toBe(already)
  })
})
