import { describe, expect, it } from 'vitest'
import {
  createEmptyWorkHistoryEntry,
  calculateExperienceYears,
  getMonthNames,
  getWorkHistoryEntryErrors,
  hasInvalidWorkHistory,
  isWorkHistoryEntryEmpty,
  mapApiWorkHistoryToForm,
  sanitizeWorkHistory,
  sortWorkHistoryByStartDate,
  formatYearMonth,
  type WorkHistoryFormEntry,
} from './workHistory'

const entry = (overrides: Partial<WorkHistoryFormEntry> = {}): WorkHistoryFormEntry => ({
  ...createEmptyWorkHistoryEntry(),
  ...overrides,
})

describe('workHistory · sanitizeWorkHistory', () => {
  it('выбрасывает полностью пустые записи', () => {
    expect(sanitizeWorkHistory([entry(), entry()])).toEqual([])
  })

  it('тримит и опускает ended_at для текущего места', () => {
    const result = sanitizeWorkHistory([
      entry({
        company: '  Урюк ',
        position: ' Су-шеф ',
        startedAt: '2022-03',
        isCurrent: true,
        endedAt: '2024-01',
      }),
    ])
    expect(result).toEqual([{ company: 'Урюк', position: 'Су-шеф', started_at: '2022-03' }])
  })

  it('сохраняет ended_at, city и description когда заданы', () => {
    const result = sanitizeWorkHistory([
      entry({
        company: 'Кафе',
        position: 'Повар',
        startedAt: '2020-06',
        endedAt: '2021-09',
        city: 'Минск',
        description: 'Готовил',
      }),
    ])
    expect(result[0]).toEqual({
      company: 'Кафе',
      position: 'Повар',
      started_at: '2020-06',
      ended_at: '2021-09',
      city: 'Минск',
      description: 'Готовил',
    })
  })
})

describe('workHistory · порядок и общий стаж', () => {
  it('ставит более ранние места работы в начало, а пустые — в конец', () => {
    const latest = entry({ startedAt: '2020-05' })
    const empty = entry()
    const earliest = entry({ startedAt: '2012-05' })

    expect(sortWorkHistoryByStartDate([latest, empty, earliest])).toEqual([earliest, latest, empty])
  })

  it('считает стаж по периодам и не удваивает пересекающиеся месяцы', () => {
    const workHistory = [
      entry({ startedAt: '2012-01', endedAt: '2016-01' }),
      entry({ startedAt: '2014-01', endedAt: '2020-01' }),
    ]

    expect(calculateExperienceYears(workHistory, new Date(2024, 0, 1))).toBe(5)
  })

  it('учитывает текущую работу и возвращает null без даты начала', () => {
    expect(
      calculateExperienceYears(
        [entry({ startedAt: '2021-01', isCurrent: true })],
        new Date(2024, 6, 1)
      )
    ).toBe(3)
    expect(calculateExperienceYears([entry()], new Date(2024, 6, 1))).toBeNull()
  })
})

describe('workHistory · валидация', () => {
  it('пустая запись валидна (её отбросят)', () => {
    expect(getWorkHistoryEntryErrors(entry())).toEqual({})
    expect(isWorkHistoryEntryEmpty(entry())).toBe(true)
  })

  it('частично заполненная запись помечает недостающие обязательные поля', () => {
    const errors = getWorkHistoryEntryErrors(entry({ city: 'Минск' }))
    expect(errors).toEqual({ company: true, position: true, startedAt: true })
    expect(hasInvalidWorkHistory([entry({ city: 'Минск' })])).toBe(true)
  })

  it('помечает ended_at раньше started_at', () => {
    const errors = getWorkHistoryEntryErrors(
      entry({ company: 'A', position: 'B', startedAt: '2023-05', endedAt: '2022-01' })
    )
    expect(errors.endedAt).toBe(true)
  })

  it('валидная запись без ошибок', () => {
    expect(
      getWorkHistoryEntryErrors(
        entry({ company: 'A', position: 'B', startedAt: '2022-01', endedAt: '2023-01' })
      )
    ).toEqual({})
    expect(
      hasInvalidWorkHistory([entry({ company: 'A', position: 'B', startedAt: '2022-01' })])
    ).toBe(false)
  })
})

describe('workHistory · mapApiWorkHistoryToForm', () => {
  it('isCurrent выводится из отсутствия ended_at, присваивает стабильные id', () => {
    const entries = mapApiWorkHistoryToForm([
      { company: 'A', position: 'P', started_at: '2022-01' },
      { company: 'B', position: 'Q', started_at: '2020-01', ended_at: '2021-01' },
    ])
    expect(entries).toHaveLength(2)
    const [past, current] = entries
    expect(past?.startedAt).toBe('2020-01')
    expect(current?.startedAt).toBe('2022-01')
    expect(current?.isCurrent).toBe(true)
    expect(past?.isCurrent).toBe(false)
    expect(current?.id).toBeTruthy()
    expect(current?.id).not.toBe(past?.id)
  })

  it('некорректный вход → пустой массив', () => {
    expect(mapApiWorkHistoryToForm(null)).toEqual([])
    expect(mapApiWorkHistoryToForm(undefined)).toEqual([])
  })
})

describe('workHistory · форматирование', () => {
  it('getMonthNames возвращает 12 месяцев с заглавной буквы', () => {
    const names = getMonthNames('ru')
    expect(names).toHaveLength(12)
    const firstInitial = (names[0] ?? '').charAt(0)
    expect(firstInitial).toBe(firstInitial.toUpperCase())
  })

  it('formatYearMonth содержит год и название месяца', () => {
    const formatted = formatYearMonth('2022-03', 'ru')
    expect(formatted).toContain('2022')
    expect(formatted.length).toBeGreaterThan(4)
  })

  it('formatYearMonth возвращает исходную строку на мусоре', () => {
    expect(formatYearMonth('не-дата', 'ru')).toBe('не-дата')
  })
})
