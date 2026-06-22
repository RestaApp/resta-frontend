import type { TFunction } from 'i18next'
import type { KpiItem } from '@/components/ui/kpi-row'
import type { UserData } from '@/services/api/authApi'
import type { ApiRole } from '@/shared/types/roles.types'
import { formatPhoneDisplay, toE164 } from '@/shared/utils/phone'
import { formatExperienceText } from '@/shared/utils/experience'
import { normalizeExternalUrl } from '@/shared/utils/externalUrl'
import { businessHoursRecordToFormValue } from '@/shared/utils/businessHours'
import { getProfileCompleteness } from '@/shared/utils/profileCompleteness'
import { splitSkillByDots } from '@/shared/utils/profileSkills'
import { getSupplierProfile, getSupplierTypes } from '@/shared/utils/supplierProfile'
import { formatWorkPeriod } from '@/shared/utils/workHistory'
import { buildBusinessProfileInfoRows } from '@/shared/ui/user-profile/buildBusinessProfileInfoRows'

type ProfileCompleteness = ReturnType<typeof getProfileCompleteness>

export interface ProfileTagItem {
  id: string
  label: string
}

export interface ProfileTagSection {
  id: string
  title: string
  items: ProfileTagItem[]
}

export type ProfileInfoValue =
  | {
      kind: 'text'
      value: string
      href?: string
      multiline?: boolean
    }
  | {
      kind: 'tags'
      values: ProfileTagItem[]
    }

export interface ProfileInfoRow {
  id: string
  label: string
  value: ProfileInfoValue
}

export interface ProfileInfoSection {
  id: string
  title: string
  rows: ProfileInfoRow[]
}

export interface ProfileWorkHistoryItem {
  id: string
  company: string
  position: string
  /** «Март 2022 — Январь 2024» или «Март 2022 — по наст. время» */
  period: string
  city: string
  description: string
  isCurrent: boolean
}

export interface ProfileReviewSummary {
  rating: string
  reviews: string
}

export interface ProfileViewModel {
  userProfile: UserData
  apiRole: ApiRole | null
  userName: string
  roleLabel: string
  isProfileFilled: boolean
  fillRequiredText: string
  kpis: KpiItem[]
  /** Доп. ряд KPI из GET /analytics/my (просмотры/клики за месяц). Только свой профиль. */
  analyticsKpis: KpiItem[]
  tagSections: ProfileTagSection[]
  workHistory: ProfileWorkHistoryItem[]
  infoSections: ProfileInfoSection[]
  reviewSummary: ProfileReviewSummary | null
  showNotificationSettings: boolean
  showSupport: boolean
}

interface ProfileStats {
  completedShifts: number
  myShiftsCount: number
}

interface ProfileLabelHelpers {
  getSpecializationLabel: (value: string) => string
  getSupplierTypeLabel: (value: string) => string
  getRestaurantFormatLabel: (value: string) => string
  getCuisineTypeLabel: (value: string) => string
}

interface BuildProfileViewModelParams extends ProfileStats, ProfileLabelHelpers {
  t: TFunction
  userProfile: UserData
  apiRole: ApiRole | null
  userName: string
  roleLabel: string
  completeness: ProfileCompleteness | null
  /** Скрыть KPI и блок отзывов (например, поставщик смотрит карточку ресторана). */
  hideMetrics?: boolean
  /** GET /analytics/my — только для своего профиля; на чужих не передаётся. */
  profileViewsThisMonth?: number | null
  contactClicksThisMonth?: number | null
}

const normalizeText = (value: string | null | undefined) => value?.trim() || ''

const uniqueValues = (values: Array<string | null | undefined>) => {
  return Array.from(new Set(values.map(normalizeText).filter(Boolean)))
}

const toTagItems = (values: string[], getLabel: (value: string) => string): ProfileTagItem[] => {
  return values.map(value => ({ id: value, label: getLabel(value) }))
}

const normalizeNumber = (value: unknown): number | null => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const formatRating = (value: unknown) => {
  const rating = normalizeNumber(value)
  return rating != null && rating > 0 ? rating.toFixed(1) : '—'
}

const formatReviews = (value: unknown) => {
  const reviews = normalizeNumber(value)
  return reviews != null && reviews > 0 ? String(reviews) : '—'
}

const buildReviewSummary = (userProfile: UserData): ProfileReviewSummary | null => {
  const rating = normalizeNumber(userProfile.average_rating)
  const reviews = normalizeNumber(userProfile.total_reviews)
  if ((rating == null || rating <= 0) && (reviews == null || reviews <= 0)) return null

  return {
    rating: rating != null && rating > 0 ? rating.toFixed(1) : '—',
    reviews: reviews != null && reviews > 0 ? String(reviews) : '0',
  }
}

const getFillRequiredText = (t: TFunction, apiRole: ApiRole | null) => {
  if (apiRole === 'restaurant') return t('profile.fillToApplyRestaurant')
  if (apiRole === 'supplier') return t('profile.fillToApplySupplier')
  return t('profile.fillToApply')
}

const getInfoTitle = (t: TFunction, apiRole: ApiRole | null) => {
  if (apiRole === 'restaurant') return t('roles.venueInfoTitle')
  if (apiRole === 'supplier') return t('roles.supplierInfoTitle')
  return t('profile.personalInfo')
}

const buildKpis = ({
  t,
  apiRole,
  userProfile,
  completedShifts,
  myShiftsCount,
}: Pick<
  BuildProfileViewModelParams,
  't' | 'apiRole' | 'userProfile' | 'completedShifts' | 'myShiftsCount'
>): KpiItem[] => {
  const rating = normalizeNumber(userProfile.average_rating)
  const reviews = normalizeNumber(userProfile.total_reviews)
  const items: KpiItem[] = []

  if (apiRole === 'employee') {
    items.push({
      id: 'shifts',
      value: completedShifts,
      label: t('profile.kpi.shifts'),
    })
  }

  if (apiRole === 'restaurant') {
    items.push({
      id: 'created',
      value: myShiftsCount,
      label: t('profile.kpi.created'),
    })
  }

  items.push(
    {
      id: 'rating',
      value: formatRating(rating),
      label: t('profile.kpi.rating'),
      tone: rating != null && rating > 0 ? 'success' : 'muted',
    },
    {
      id: 'reviews',
      value: formatReviews(reviews),
      label: t('common.reviews5'),
      tone: reviews != null && reviews > 0 ? 'default' : 'muted',
    }
  )

  return items
}

const buildAnalyticsKpis = ({
  t,
  profileViewsThisMonth,
  contactClicksThisMonth,
}: Pick<
  BuildProfileViewModelParams,
  't' | 'profileViewsThisMonth' | 'contactClicksThisMonth'
>): KpiItem[] => {
  // null/undefined = данные analytics/my не загружены → ряд не строим.
  // normalizeNumber(null) дал бы 0, поэтому отсекаем отсутствие явно.
  const views = profileViewsThisMonth == null ? null : normalizeNumber(profileViewsThisMonth)
  const clicks = contactClicksThisMonth == null ? null : normalizeNumber(contactClicksThisMonth)
  if (views == null && clicks == null) return []

  return [
    {
      id: 'profile-views',
      value: views ?? '—',
      label: t('profile.kpi.viewsThisMonth'),
      tone: views != null && views > 0 ? 'primary' : 'muted',
    },
    {
      id: 'contact-clicks',
      value: clicks ?? '—',
      label: t('profile.kpi.contactClicks'),
      tone: clicks != null && clicks > 0 ? 'default' : 'muted',
    },
  ]
}

const buildTagSections = ({
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

const buildWorkHistory = ({
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

const buildInfoSections = ({
  t,
  apiRole,
  userProfile,
  getRestaurantFormatLabel,
}: Pick<
  BuildProfileViewModelParams,
  't' | 'apiRole' | 'userProfile' | 'getRestaurantFormatLabel'
>) => {
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

export const buildProfileViewModel = (params: BuildProfileViewModelParams): ProfileViewModel => {
  const { t, apiRole, userProfile, userName, roleLabel, completeness, hideMetrics = false } = params

  return {
    userProfile,
    apiRole,
    userName,
    roleLabel,
    isProfileFilled: completeness?.isFilled ?? false,
    fillRequiredText: getFillRequiredText(t, apiRole),
    kpis: hideMetrics ? [] : buildKpis(params),
    analyticsKpis: hideMetrics ? [] : buildAnalyticsKpis(params),
    tagSections: buildTagSections(params),
    workHistory: buildWorkHistory(params),
    infoSections: buildInfoSections(params),
    reviewSummary: hideMetrics ? null : buildReviewSummary(userProfile),
    showNotificationSettings: apiRole !== 'supplier',
    showSupport: apiRole != null && apiRole !== 'unverified',
  }
}
