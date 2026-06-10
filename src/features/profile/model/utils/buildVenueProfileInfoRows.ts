import type { TFunction } from 'i18next'
import type { UserData } from '@/services/api/authApi'
import type { ProfileInfoRow } from '@/shared/ui/user-profile/buildProfileViewModel'
import { formatPhoneDisplay, toE164 } from '@/shared/utils/phone'
import { normalizeExternalUrl } from '@/shared/utils/externalUrl'
import { businessHoursRecordToFormValue } from '@/shared/utils/businessHours'

interface BuildVenueProfileInfoRowsParams {
  t: TFunction
  userProfile: UserData
  venueTypeLabel: string
}

const normalizeText = (value: string | null | undefined) => value?.trim() || ''

const pushTextRow = (
  rows: ProfileInfoRow[],
  row: {
    id: string
    labelKey: string
    value: string | null | undefined
    href?: string
    multiline?: boolean
  },
  t: TFunction
) => {
  const value = normalizeText(row.value)
  if (!value) return

  rows.push({
    id: row.id,
    label: t(row.labelKey),
    value: {
      kind: 'text',
      value,
      href: row.href,
      multiline: row.multiline,
    },
  })
}

export const buildVenueProfileInfoRows = ({
  t,
  userProfile,
  venueTypeLabel,
}: BuildVenueProfileInfoRowsParams): ProfileInfoRow[] => {
  const rows: ProfileInfoRow[] = []
  const addresses = (userProfile.location ?? []).map(line => line.trim()).filter(Boolean)
  const phoneDisplay = formatPhoneDisplay(userProfile.phone)
  const businessHours = businessHoursRecordToFormValue(userProfile.business_hours)

  pushTextRow(
    rows,
    {
      id: 'venue-type',
      labelKey: 'profile.venueType',
      value: venueTypeLabel,
    },
    t
  )

  pushTextRow(
    rows,
    {
      id: 'address',
      labelKey: 'profileFields.address',
      value: addresses.join('\n'),
      multiline: true,
    },
    t
  )

  pushTextRow(
    rows,
    {
      id: 'phone',
      labelKey: 'profile.phone',
      value: phoneDisplay,
      href: userProfile.phone ? `tel:${toE164(userProfile.phone)}` : undefined,
    },
    t
  )

  pushTextRow(
    rows,
    {
      id: 'website',
      labelKey: 'profile.venueWebsite',
      value: userProfile.website,
      href: userProfile.website ? normalizeExternalUrl(userProfile.website) : undefined,
    },
    t
  )

  pushTextRow(
    rows,
    {
      id: 'business-hours',
      labelKey: 'profile.businessHours',
      value: businessHours,
      multiline: true,
    },
    t
  )

  return rows
}
