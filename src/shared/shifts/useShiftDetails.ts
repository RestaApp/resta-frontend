import { useMemo } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from './types'
import { formatHourlyRate, getVacancyTitle } from './formatting'
import { useLabels } from '@/shared/i18n/hooks'

export const useShiftDetails = (shift: Shift | null, vacancyData?: VacancyApiItem | null) => {
  const { getEmployeePositionLabel } = useLabels()

  const hourlyRate = useMemo(
    () => formatHourlyRate(vacancyData?.hourly_rate ?? null),
    [vacancyData]
  )

  const vacancyTitle = useMemo(
    () => getVacancyTitle(vacancyData?.title ?? null, shift?.position ?? null),
    [vacancyData, shift]
  )

  const positionLabel = useMemo(() => {
    if (!vacancyData?.position) return null
    return getEmployeePositionLabel(vacancyData.position)
  }, [vacancyData, getEmployeePositionLabel])

  return {
    hourlyRate,
    vacancyTitle,
    positionLabel,
  }
}
