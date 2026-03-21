import { describe, expect, it } from 'vitest'
import { getErrorMessage } from './getErrorMessage'

describe('getErrorMessage', () => {
  it('возвращает null для null/undefined', () => {
    expect(getErrorMessage(null)).toBeNull()
    expect(getErrorMessage(undefined)).toBeNull()
  })

  it('возвращает строку как есть', () => {
    expect(getErrorMessage('ошибка')).toBe('ошибка')
  })

  it('извлекает первый элемент errors из data', () => {
    expect(getErrorMessage({ data: { errors: ['первая', 'вторая'] } })).toBe('первая')
  })

  it('извлекает message из data', () => {
    expect(getErrorMessage({ data: { message: 'текст' } })).toBe('текст')
  })

  it('извлекает error из data', () => {
    expect(getErrorMessage({ data: { error: 'код' } })).toBe('код')
  })

  it('возвращает message у Error', () => {
    expect(getErrorMessage(new Error('сбой'))).toBe('сбой')
  })

  it('возвращает null для неизвестного объекта', () => {
    expect(getErrorMessage({ foo: 1 })).toBeNull()
  })
})
