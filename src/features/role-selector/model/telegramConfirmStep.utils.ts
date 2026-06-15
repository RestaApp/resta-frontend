import { formatPhoneInput } from '@/shared/utils/phone'

interface ResolvePreferredPhoneParams {
  manualPhone: string
  phoneFromProfile: string
}

export const resolvePreferredPhone = ({
  manualPhone,
  phoneFromProfile,
}: ResolvePreferredPhoneParams) => {
  const trimmedManualPhone = manualPhone.trim()
  if (trimmedManualPhone) return trimmedManualPhone
  return phoneFromProfile.trim()
}

export const getConfirmedSharedPhone = (phone: string | null | undefined) => {
  const trimmedPhone = phone?.trim() || ''
  if (!trimmedPhone) return null
  return formatPhoneInput(trimmedPhone) || trimmedPhone
}
