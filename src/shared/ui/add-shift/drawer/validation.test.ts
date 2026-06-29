import { describe, it, expect } from 'vitest'
import {
  hasLocation,
  isStepValid,
  findFirstInvalidStep,
  buildDrawerErrorState,
  type AddShiftDrawerFormState,
} from './validation'

/** Полностью валидная смена-replacement (со всеми обязательными полями всех шагов). */
const validForm = (over: Partial<AddShiftDrawerFormState> = {}): AddShiftDrawerFormState => ({
  title: 'Бариста',
  date: '2026-07-01',
  startTime: '10:00',
  endTime: '18:00',
  location: ['ул. Ленина, 1'],
  city: 'Минск',
  description: 'Описание смены',
  requirements: 'Требования',
  shiftType: 'replacement',
  position: 'barista',
  specializations: ['coffee'],
  submitError: null,
  fieldErrors: {},
  payError: null,
  timeRangeError: null,
  dateError: null,
  positionError: null,
  ...over,
})

describe('hasLocation', () => {
  it('true при непустой строке, false при пустых/пробелах', () => {
    expect(hasLocation(['  ', 'ул. Ленина'])).toBe(true)
    expect(hasLocation(['', '   '])).toBe(false)
    expect(hasLocation([])).toBe(false)
  })
})

describe('isStepValid', () => {
  it('шаг 0 (replacement): требует title + дату/время без ошибок', () => {
    expect(isStepValid(validForm(), 0)).toBe(true)
    expect(isStepValid(validForm({ title: '  ' }), 0)).toBe(false)
    expect(isStepValid(validForm({ date: null }), 0)).toBe(false)
    expect(isStepValid(validForm({ timeRangeError: 'bad' }), 0)).toBe(false)
    expect(isStepValid(validForm({ payError: 'bad' }), 0)).toBe(false)
  })

  it('шаг 0 (vacancy): дата/время не обязательны, важен только title и payError', () => {
    const vacancy = validForm({ shiftType: 'vacancy', date: null, startTime: '', endTime: '' })
    expect(isStepValid(vacancy, 0)).toBe(true)
    expect(isStepValid({ ...vacancy, payError: 'bad' }, 0)).toBe(false)
    expect(isStepValid({ ...vacancy, title: '' }, 0)).toBe(false)
  })

  it('шаг 1: город + локация + позиция + хотя бы одна специализация', () => {
    expect(isStepValid(validForm(), 1)).toBe(true)
    expect(isStepValid(validForm({ city: '' }), 1)).toBe(false)
    expect(isStepValid(validForm({ location: [''] }), 1)).toBe(false)
    expect(isStepValid(validForm({ position: '' }), 1)).toBe(false)
    expect(isStepValid(validForm({ positionError: 'bad' }), 1)).toBe(false)
    expect(isStepValid(validForm({ specializations: [] }), 1)).toBe(false)
  })

  it('шаг 2: описание + требования', () => {
    expect(isStepValid(validForm(), 2)).toBe(true)
    expect(isStepValid(validForm({ description: ' ' }), 2)).toBe(false)
    expect(isStepValid(validForm({ requirements: '' }), 2)).toBe(false)
  })
})

describe('findFirstInvalidStep', () => {
  it('валидная форма → последний шаг (2)', () => {
    expect(findFirstInvalidStep(validForm())).toBe(2)
  })

  it('возвращает самый ранний невалидный шаг', () => {
    expect(findFirstInvalidStep(validForm({ title: '' }))).toBe(0)
    expect(findFirstInvalidStep(validForm({ city: '' }))).toBe(1)
    expect(findFirstInvalidStep(validForm({ specializations: [] }))).toBe(1)
    expect(findFirstInvalidStep(validForm({ description: '' }))).toBe(2)
  })

  it('ошибка серверной валидации специализаций возвращает шаг 1', () => {
    expect(findFirstInvalidStep(validForm({ fieldErrors: { specializations: 'invalid' } }))).toBe(1)
  })

  it('vacancy: пустые дата/время не делают шаг 0 невалидным', () => {
    const vacancy = validForm({ shiftType: 'vacancy', date: null, startTime: '', endTime: '' })
    expect(findFirstInvalidStep(vacancy)).toBe(2)
  })
})

describe('buildDrawerErrorState', () => {
  const t = (key: string) => key
  const base = {
    attemptedSteps: [false, false, false] as [boolean, boolean, boolean],
    didAttemptSubmit: false,
    requiredFieldError: 'required',
    t,
  }

  it('без попыток и ошибок — ничего не подсвечивает', () => {
    const res = buildDrawerErrorState({ ...base, form: validForm({ title: '' }) })
    expect(res.showErrors).toBe(false)
    expect(res.errors.titleError).toBeUndefined()
    expect(res.bannerError).toBeNull()
  })

  it('после submit подсвечивает пустые обязательные + баннер', () => {
    const res = buildDrawerErrorState({
      ...base,
      didAttemptSubmit: true,
      form: validForm({ title: '' }),
    })
    expect(res.showErrors).toBe(true)
    expect(res.errors.titleError).toBe(' ')
    expect(res.bannerError).toBe('validation.fillRequired')
  })

  it('submitError имеет приоритет в баннере', () => {
    const res = buildDrawerErrorState({
      ...base,
      didAttemptSubmit: true,
      form: validForm({ submitError: 'Сервер отверг' }),
    })
    expect(res.bannerError).toBe('Сервер отверг')
  })

  it('attemptedSteps[1] раскрывает ошибки только шага 1', () => {
    const res = buildDrawerErrorState({
      ...base,
      attemptedSteps: [false, true, false],
      form: validForm({ title: '', city: '' }),
    })
    expect(res.showStep1Errors).toBe(true)
    expect(res.errors.cityFieldError).toBe(' ')
    // шаг 0 не атакован и submit не было → title не подсвечен
    expect(res.errors.titleError).toBeUndefined()
  })
})
