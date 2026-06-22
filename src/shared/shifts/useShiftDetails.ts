import { useMemo } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from './types'
import { formatHourlyRate, getVacancyTitle } from './formatting'
import { useLabels } from '@/shared/i18n/hooks'

export const useShiftDetails = (shift: Shift | null, vacancyData?: VacancyApiItem | null) => {
  const { getEmployeePositionLabel, getSpecializationLabel } = useLabels()

  const hourlyRate = useMemo(
    () => formatHourlyRate(vacancyData?.hourly_rate ?? null),
    [vacancyData]
  )

  // Локализованная строка «Позиция • Специализация». Фолбэк на shift.position,
  // чтобы позиция была видна даже без полного vacancyData (переход из списка).
  const positionLine = useMemo(() => {
    const positionCode = vacancyData?.position ?? shift?.position ?? null
    if (!positionCode) return ''
    const position = getEmployeePositionLabel(positionCode)
    const specializationCode = shift?.specialization ?? null
    const specialization = specializationCode ? getSpecializationLabel(specializationCode) : ''
    return specialization ? `${position} • ${specialization}` : position
  }, [vacancyData, shift, getEmployeePositionLabel, getSpecializationLabel])

  const hasCustomTitle = Boolean(vacancyData?.title?.trim())

  // Заголовок: название вакансии, иначе локализованная позиция (не сырой код).
  const vacancyTitle = useMemo(
    () => getVacancyTitle(vacancyData?.title ?? null, positionLine || (shift?.position ?? null)),
    [vacancyData, positionLine, shift]
  )

  return {
    hourlyRate,
    vacancyTitle,
    positionLine,
    hasCustomTitle,
  }
}
