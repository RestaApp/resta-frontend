import type { TFunction } from 'i18next'
import type { UserData } from '@/services/api/authApi'
import type { ProfileInfoRow } from '@/shared/ui/user-profile/buildProfileViewModel'
import {
  buildBusinessProfileInfoRows,
  pushProfileTextRow,
} from '@/shared/ui/user-profile/buildBusinessProfileInfoRows'

interface BuildVenueProfileInfoRowsParams {
  t: TFunction
  userProfile: UserData
  venueTypeLabel: string
}

export const buildVenueProfileInfoRows = ({
  t,
  userProfile,
  venueTypeLabel,
}: BuildVenueProfileInfoRowsParams): ProfileInfoRow[] => {
  const rows: ProfileInfoRow[] = []

  pushProfileTextRow(rows, {
    id: 'venue-type',
    label: t('profile.venueType'),
    value: venueTypeLabel,
  })

  rows.push(...buildBusinessProfileInfoRows({ t, userProfile }))

  return rows
}
