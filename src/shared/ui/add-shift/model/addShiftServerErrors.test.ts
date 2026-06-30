import { describe, it, expect } from 'vitest'
import {
  extractServerErrors,
  hasInlineErrors,
  inlineErrorMessages,
  toServerErrorMessages,
  vacancyUniquenessToken,
} from './addShiftServerErrors'

describe('toServerErrorMessages', () => {
  it('vacancy_uniqueness: возвращает текст error, иначе сам токен', () => {
    expect(toServerErrorMessages({ feature: vacancyUniquenessToken, error: 'Дубликат' })).toEqual([
      'Дубликат',
    ])
    expect(toServerErrorMessages({ feature: vacancyUniquenessToken })).toEqual([
      vacancyUniquenessToken,
    ])
  })

  it('приоритет errors[] над message/error', () => {
    expect(
      toServerErrorMessages({ errors: ['a', 'b'], message: 'ignored', error: 'ignored' })
    ).toEqual(['a', 'b'])
  })

  it('приводит элементы errors к строкам', () => {
    expect(toServerErrorMessages({ errors: [1, 'x'] })).toEqual(['1', 'x'])
  })

  it('падает на message, затем на error', () => {
    expect(toServerErrorMessages({ message: 'msg' })).toEqual(['msg'])
    expect(toServerErrorMessages({ error: 'err' })).toEqual(['err'])
  })

  it('пустой мешок → []', () => {
    expect(toServerErrorMessages({})).toEqual([])
  })
})

describe('extractServerErrors', () => {
  it('RTK-ошибка с data.errors → messages', () => {
    expect(extractServerErrors({ status: 422, data: { errors: ['e1'] } })).toEqual({
      messages: ['e1'],
    })
  })

  it('RTK-ошибка с data.message → messages', () => {
    expect(extractServerErrors({ data: { message: 'boom' } })).toEqual({ messages: ['boom'] })
  })

  it('RTK-ошибка с пустым data → нет messages, fallthrough', () => {
    expect(extractServerErrors({ data: {} })).toEqual({})
  })

  it('нативный Error → single', () => {
    expect(extractServerErrors(new Error('network'))).toEqual({ single: 'network' })
  })

  it('неизвестное значение → {}', () => {
    expect(extractServerErrors('strange')).toEqual({})
    expect(extractServerErrors(null)).toEqual({})
  })
})

describe('hasInlineErrors', () => {
  it('true для success:false / непустого errors', () => {
    expect(hasInlineErrors({ success: false })).toBe(true)
    expect(hasInlineErrors({ errors: ['x'] })).toBe(true)
  })

  it('false для не-объекта', () => {
    expect(hasInlineErrors(null)).toBe(false)
    expect(hasInlineErrors('nope')).toBe(false)
  })

  it('false для успешного ответа без ошибок', () => {
    expect(hasInlineErrors({ success: true, data: { id: 1 } })).toBe(false)
  })
})

describe('inlineErrorMessages', () => {
  it('парсит сообщения из инлайнового ответа', () => {
    expect(inlineErrorMessages({ errors: ['a'] })).toEqual(['a'])
  })

  it('не-объект → []', () => {
    expect(inlineErrorMessages(undefined)).toEqual([])
  })
})
