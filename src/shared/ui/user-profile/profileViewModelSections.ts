import type { TFunction } from 'i18next'
import type { ApiRole } from '@/shared/types/roles.types'
import { formatPhoneDisplay, toE164 } from '@/shared/utils/phone'
import { formatExperienceText } from '@/shared/utils/experience'
import { normalizeExternalUrl } from '@/shared/utils/externalUrl'
import { businessHoursRecordToFormValue } from '@/shared/utils/businessHours'
import { splitSkillByDots } from '@/shared/utils/profileSkills'
import { getSupplierProfile, getSupplierTypes } from '@/shared/utils/supplierProfile'
import { formatWorkPeriod } from '@/shared/utils/workHistory'
import { buildBusinessProfileInfoRows } from '@/shared/ui/user-profile/buildBusinessProfileInfoRows'
import type {
  BuildProfileViewModelParams,
  ProfileInfoRow,
  ProfileInfoSection,
  ProfileTagItem,
  ProfileTagSection,
  ProfileWorkHistoryItem,
} from './profileViewModel.types'

const normalizeText = (value: string | null | undefined) => value?.trim() || ''

const uniqueValues = (values: Array<string | null | undefined>) => {
  return Array.from(new Set(values.map(normalizeText).filter(Boolean)))
}

const toTagItems = (values: string[], getLabel: (value: string) => string): ProfileTagItem[] => {
  return values.map(value => ({ id: value, label: getLabel(value) }))
}

const getInfoTitle = (t: TFunction, apiRole: ApiRole | null) => {
  if (apiRole === 'restaurant') return t('roles.venueInfoTitle')
  if (apiRole === 'supplier') return t('roles.supplierInfoTitle')
  return t('profile.personalInfo')
}

export const buildTagSections = ({
  t,
  apiRole,
  userProfile,
  getSpecializationLabel,
  getSupplierTypeLabel,
  getCuisineTypeLabel,
}: Pick<
  BuildProfileViewModelParams,
  | 't'
  | 'apiRole'
  | 'userProfile'
  | 'getSpecializationLabel'
  | 'getSupplierTypeLabel'
  | 'getCuisineTypeLabel'
>): ProfileTagSection[] => {
  const sections: ProfileTagSection[] = []

  if (apiRole === 'employee') {
    const specializations = uniqueValues(userProfile.employee_profile?.specializations ?? [])
    const experienceYears = userProfile.employee_profile?.experience_years
    const tags = [...toTagItems(specializations, getSpecializationLabel)]

    if (typeof experienceYears === 'number') {
      tags.push({
        id: 'experience',
        label: formatExperienceText(experienceYears),
      })
    }

    sections.push({
      id: 'employee-specializations',
      title: t('profile.specializationSection'),
      items: tags,
    })
  }

  if (apiRole === 'restaurant') {
    const cuisineTypes = uniqueValues(userProfile.restaurant_profile?.cuisine_types ?? [])
    if (cuisineTypes.length > 0) {
      sections.push({
        id: 'restaurant-cuisines',
        title: t('profile.cuisineTypesLabel'),
        items: toTagItems(cuisineTypes, getCuisineTypeLabel),
      })
    }
  }

  if (apiRole === 'supplier') {
    const supplierProfile = getSupplierProfile(userProfile)
    const types = getSupplierTypes(supplierProfile)

    sections.push({
      id: 'supplier-types',
      title: t('profile.supplierTypesLabel'),
      items: toTagItems(uniqueValues(types), getSupplierTypeLabel),
    })
  }

  return sections
}

export const buildWorkHistory = ({
  apiRole,
  userProfile,
}: Pick<BuildProfileViewModelParams, 'apiRole' | 'userProfile'>): ProfileWorkHistoryItem[] => {
  if (apiRole !== 'employee') return []
  const entries = userProfile.work_history
  if (!Array.isArray(entries)) return []

  return entries
    .map((entry, index) => {
      const company = normalizeText(entry.company)
      const position = normalizeText(entry.position)
      const startedAt = normalizeText(entry.started_at)
      if (!company && !position && !startedAt) return null

      return {
        id: `work-${index}`,
        company,
        position,
        period: startedAt ? formatWorkPeriod(startedAt, entry.ended_at) : '',
        city: normalizeText(entry.city),
        description: normalizeText(entry.description),
        isCurrent: !normalizeText(entry.ended_at),
      }
    })
    .filter((item): item is ProfileWorkHistoryItem => item != null)
}

const pushTextRow = (
  rows: ProfileInfoRow[],
  row: Omit<ProfileInfoRow, 'value'> & {
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

const pushTagsRow = (
  rows: ProfileInfoRow[],
  row: Omit<ProfileInfoRow, 'value'> & { values: ProfileTagItem[] }
) => {
  if (row.values.length === 0) return
  rows.push({
    id: row.id,
    label: row.label,
    value: { kind: 'tags', values: row.values },
  })
}

export const buildInfoSections = ({
  t,
  apiRole,
  userProfile,
  getRestaurantFormatLabel,
}: Pick<
  BuildProfileViewModelParams,
  't' | 'apiRole' | 'userProfile' | 'getRestaurantFormatLabel'
>): ProfileInfoSection[] => {
  const rows: ProfileInfoRow[] = []
  const isBusinessRole = apiRole === 'restaurant' || apiRole === 'supplier'
  const addresses = (userProfile.location ?? []).map(line => line.trim()).filter(Boolean)
  const cityValue = isBusinessRole ? userProfile.city : userProfile.city || addresses[0]
  const addressValue = isBusinessRole && addresses.length > 0 ? addresses.join('\n') : null
  const phoneDisplay = formatPhoneDisplay(userProfile.phone)
  const businessHours = isBusinessRole
    ? businessHoursRecordToFormValue(userProfile.business_hours)
    : ''
  const supplierProfile = getSupplierProfile(userProfile)

  pushTextRow(rows, {
    id: 'bio',
    label: t('common.description'),
    value: userProfile.bio,
    multiline: true,
  })

  if (apiRole === 'restaurant') {
    const restaurantFormat = normalizeText(userProfile.restaurant_profile?.restaurant_format)
    if (restaurantFormat) {
      pushTextRow(rows, {
        id: 'restaurant-format',
        label: t('profile.venueType'),
        value: getRestaurantFormatLabel(restaurantFormat),
      })
    }
    rows.push(
      ...buildBusinessProfileInfoRows({
        t,
        userProfile,
        includeCity: true,
        includePhone: false,
      })
    )
  } else {
    pushTextRow(rows, { id: 'city', label: t('profile.city'), value: cityValue })
    pushTextRow(rows, {
      id: 'address',
      label: t('profileFields.address', { defaultValue: 'Адрес' }),
      value: addressValue,
      multiline: true,
    })
    pushTextRow(rows, {
      id: 'website',
      label: t('profile.venueWebsite'),
      value: userProfile.website,
      href: userProfile.website ? normalizeExternalUrl(userProfile.website) : undefined,
    })
    pushTextRow(rows, {
      id: 'business-hours',
      label: t('profile.businessHours'),
      value: businessHours,
      multiline: true,
    })
  }

  if (apiRole === 'employee') {
    pushTextRow(rows, { id: 'name', label: t('profile.nameLabel'), value: userProfile.name })
    pushTextRow(rows, { id: 'surname', label: t('profile.surname'), value: userProfile.last_name })

    const employeeProfile = userProfile.employee_profile
    if (employeeProfile) {
      if (typeof employeeProfile.experience_years === 'number') {
        pushTextRow(rows, {
          id: 'experience',
          label: t('profile.experience'),
          value: formatExperienceText(employeeProfile.experience_years),
        })
      }

      if (typeof employeeProfile.open_to_work === 'boolean') {
        pushTextRow(rows, {
          id: 'open-to-work',
          label: t('profile.openToWork'),
          value: employeeProfile.open_to_work ? t('common.yes') : t('common.no'),
        })
      }

      const skills = Array.isArray(employeeProfile.skills)
        ? employeeProfile.skills.flatMap(splitSkillByDots)
        : []
      pushTagsRow(rows, {
        id: 'skills',
        label: t('profile.skills'),
        values: toTagItems(uniqueValues(skills), value => value),
      })
    }
  }

  if (apiRole === 'supplier') {
    const deliveryAvailable = supplierProfile?.delivery_available
    if (typeof deliveryAvailable === 'boolean') {
      pushTextRow(rows, {
        id: 'delivery',
        label: t('venueUi.suppliers.filters.delivery', { defaultValue: 'Доставка' }),
        value: deliveryAvailable
          ? t('venueUi.suppliers.deliveryYes', { defaultValue: 'Есть доставка' })
          : t('venueUi.suppliers.deliveryNo', { defaultValue: 'Без доставки' }),
      })
    }

    const priceListUrl = normalizeText(supplierProfile?.price_list_url)
    if (priceListUrl) {
      pushTextRow(rows, {
        id: 'price-list',
        label: t('profile.priceListUrl'),
        value: priceListUrl,
        href: normalizeExternalUrl(priceListUrl),
      })
    }
  }

  pushTextRow(rows, {
    id: 'email',
    label: t('profile.email'),
    value: userProfile.email,
    href: userProfile.email ? `mailto:${userProfile.email}` : undefined,
  })
  pushTextRow(rows, {
    id: 'phone',
    label: t('profile.phone'),
    value: phoneDisplay,
    href: userProfile.phone ? `tel:${toE164(userProfile.phone)}` : undefined,
  })

  return rows.length > 0 ? [{ id: 'main', title: getInfoTitle(t, apiRole), rows }] : []
}
