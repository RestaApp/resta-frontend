import type { ApplicationPreviewApiItem } from '@/services/api/shiftsApi'

const normalizeKeys = (values: Array<string | null | undefined> | undefined): string[] => {
  if (!values?.length) return []

  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of values) {
    const value = raw?.trim()
    if (!value || seen.has(value)) continue
    seen.add(value)
    result.push(value)
  }

  return result
}

/** Специализации отклика: корень заявки → профиль сотрудника → одиночное поле. */
export const resolveApplicantSpecializations = (app: ApplicationPreviewApiItem): string[] => {
  const fromApp = normalizeKeys(app.specializations)
  if (fromApp.length > 0) return fromApp

  const fromProfile = normalizeKeys(app.user?.employee_profile?.specializations)
  if (fromProfile.length > 0) return fromProfile

  const singleProfile = app.user?.employee_profile?.specialization?.trim()
  if (singleProfile) return [singleProfile]

  const singleUser = app.user?.specialization?.trim()
  if (singleUser) return [singleUser]

  return []
}
