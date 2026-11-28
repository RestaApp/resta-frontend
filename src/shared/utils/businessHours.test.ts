import { describe, expect, it } from 'vitest'
import {
  businessHoursRecordToFormValue,
  formatBusinessHours,
  formValueToBusinessHoursRecord,
} from './businessHours'
import type { DayLabels } from './businessHoursSchedule'

const RU: DayLabels = {
  mon: 'Пн',
  tue: 'Вт',
  wed: 'Ср',
  thu: 'Чт',
  fri: 'Пт',
  sat: 'Сб',
  sun: 'Вс',
}
const EN: DayLabels = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
}

/** Запись по дням недели — формат контракта API. */
const BY_DAY = {
  mon: '10:00-19:00',
  tue: '10:00-19:00',
  wed: '10:00-19:00',
  thu: '10:00-19:00',
  fri: '10:00-19:00',
  sat: '10:00-16:00',
  sun: '10:00-16:00',
}

describe('formatBusinessHours', () => {
  it('переводит ключи дней и группирует дни с одинаковым временем', () => {
    expect(formatBusinessHours(BY_DAY, RU)).toBe('Пн-Пт 10:00-19:00\nСб-Вс 10:00-16:00')
  })

  it('показывает дни на языке приложения', () => {
    expect(formatBusinessHours(BY_DAY, EN)).toBe('Mon-Fri 10:00-19:00\nSat-Sun 10:00-16:00')
  })

  it('пропускает выходные: closed и отсутствующие дни', () => {
    const record = { mon: '08:00-17:00', tue: '08:00-17:00', sat: 'closed' }

    expect(formatBusinessHours(record, RU)).toBe('Пн-Вт 08:00-17:00')
  })

  it('выводит особые условия графика после расписания, без технического ключа', () => {
    const record = { mon: '09:00-18:00', notes: 'Обед 13:00–14:00' }

    expect(formatBusinessHours(record, RU)).toBe('Пн 09:00-18:00\nОбед 13:00–14:00')
  })

  it('не теряет значения, которые не удалось прочитать как время', () => {
    const record = {
      mon: '10:00-19:00',
      tue: '10-19',
      wed: 'круглосуточно',
      extra: 'вне контракта',
    }

    expect(formatBusinessHours(record, RU)).toBe(
      'Пн 10:00-19:00\nВт: 10-19\nСр: круглосуточно\nextra: вне контракта'
    )
  })

  it('читает старые записи, сохранённые одним текстом', () => {
    const record = { schedule: 'Пн-Пт 09:00-22:00\nСб 09:00-00:00' }

    expect(formatBusinessHours(record, EN)).toBe('Mon-Fri 09:00-22:00\nSat 09:00-00:00')
  })

  it('оставляет как есть старый текст, который не является расписанием', () => {
    expect(formatBusinessHours({ schedule: 'Круглосуточно, без выходных' }, EN)).toBe(
      'Круглосуточно, без выходных'
    )
  })

  it('возвращает пустую строку, когда часов работы нет', () => {
    expect(formatBusinessHours(null, RU)).toBe('')
    expect(formatBusinessHours({}, RU)).toBe('')
  })
})

describe('formValueToBusinessHoursRecord', () => {
  it('сохраняет расписание по дням недели, выходные дни не пишет', () => {
    expect(formValueToBusinessHoursRecord('Пн-Ср 09:00-18:00\nСб 10:00-15:00')).toEqual({
      mon: '09:00-18:00',
      tue: '09:00-18:00',
      wed: '09:00-18:00',
      sat: '10:00-15:00',
    })
  })

  it('особые условия графика кладёт в notes', () => {
    expect(formValueToBusinessHoursRecord('Пн 09:00-18:00\nОбед 13:00–14:00')).toEqual({
      mon: '09:00-18:00',
      notes: 'Обед 13:00–14:00',
    })
  })

  it('пустой текст — сохранять нечего', () => {
    expect(formValueToBusinessHoursRecord('  ')).toBeUndefined()
  })
})

describe('чтение и запись согласованы', () => {
  it('запись API без изменений переживает загрузку в форму и сохранение', () => {
    const record = { mon: '09:00-18:00', tue: '09:00-18:00', sun: '11:00-16:00', notes: 'Обед' }

    expect(formValueToBusinessHoursRecord(businessHoursRecordToFormValue(record))).toEqual(record)
  })

  it('старая текстовая запись при сохранении переходит в формат по дням', () => {
    const legacy = { schedule: 'Пн-Вт 09:00-18:00\nБез обеда' }

    expect(formValueToBusinessHoursRecord(businessHoursRecordToFormValue(legacy))).toEqual({
      mon: '09:00-18:00',
      tue: '09:00-18:00',
      notes: 'Без обеда',
    })
  })
})
