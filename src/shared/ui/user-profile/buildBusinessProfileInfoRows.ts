import type { TFunction } from 'i18next'
import type { UserData } from '@/services/api/authApi'
import type { ProfileInfoRow } from '@/shared/ui/user-profile/buildProfileViewModel'
import { formatPhoneDisplay, toE164 } from '@/shared/utils/phone'
import { normalizeExternalUrl } from '@/shared/utils/externalUrl'
import { businessHoursRecordToFormValue } from '@/shared/utils/businessHours'

const normalizeText = (value: string | null | undefined) => value?.trim() || ''

export const pushProfileTextRow = (
  rows: ProfileInfoRow[],
  row: {
    id: string
    label: string
    value: string | null | undefined
    href?: string
    multiline?: boolean
  }
) => {
  const value = normalizeText(row.value)
  if (!value) return

  rows.push({
    id: row.id,
    label: row.label,
    value: {
      kind: 'text',
      value,
      href: row.href,
      multiline: row.multiline,
    },
  })
}

interface BuildBusinessProfileInfoRowsParams {
  t: TFunction
  userProfile: UserData
  includeCity?: boolean
  includePhone?: boolean
}

export const buildBusinessProfileInfoRows = ({
  t,
  userProfile,
  includeCity = false,
  includePhone = true,
}: BuildBusinessProfileInfoRowsParams): ProfileInfoRow[] => {
  const rows: ProfileInfoRow[] = []
  const addresses = (userProfile.location ?? []).map(line => line.trim()).filter(Boolean)
  const phoneDisplay = formatPhoneDisplay(userProfile.phone)
  const businessHours = businessHoursRecordToFormValue(userProfile.business_hours)

  if (includeCity) {
    pushProfileTextRow(rows, {
      id: 'city',
      label: t('profile.city'),
      value: userProfile.city,
    })
  }

  pushProfileTextRow(rows, {
    id: 'address',
    label: t('profileFields.address', { defaultValue: 'Адрес' }),
    value: addresses.join('\n'),
    multiline: true,
  })

  if (includePhone) {
    pushProfileTextRow(rows, {
      id: 'phone',
      label: t('profile.phone'),
      value: phoneDisplay,
      href: userProfile.phone ? `tel:${toE164(userProfile.phone)}` : undefined,
    })
  }

  pushProfileTextRow(rows, {
    id: 'website',
    label: t('profile.venueWebsite'),
    value: userProfile.website,
    href: userProfile.website ? normalizeExternalUrl(userProfile.website) : undefined,
  })

  pushProfileTextRow(rows, {
    id: 'business-hours',
    label: t('profile.businessHours'),
    value: businessHours,
    multiline: true,
  })

  return rows
}
