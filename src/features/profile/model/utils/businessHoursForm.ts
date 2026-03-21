/**
 * API хранит business_hours как Record<string, string>.
 * В форме используем одно текстовое поле; при сохранении кладём в ключ schedule.
 */

export function businessHoursRecordToFormValue(
  record: Record<string, string> | null | undefined
): string {
  if (!record || typeof record !== 'object') return ''
  const single =
    typeof record.schedule === 'string'
      ? record.schedule
      : typeof record.text === 'string'
        ? record.text
        : typeof record.display === 'string'
          ? record.display
          : ''
  if (single.trim()) return single
  return Object.entries(record)
    .filter(([, v]) => typeof v === 'string' && v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
}

export function formValueToBusinessHoursRecord(
  text: string
): Record<string, string> | undefined {
  const t = text.trim()
  if (!t) return undefined
  return { schedule: t }
}
