import { Edit2, Plus, SlidersHorizontal } from 'lucide-react'
import type { Tab } from '@/shared/types/navigation.types'
import type { UiRole } from '@/shared/types/roles.types'
import { UI_ROLE_TO_API_ROLE } from '@/shared/types/roles.types'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'

export type HeaderAction = {
  ariaLabel: string
  Icon: typeof Edit2
  onClick: () => void
}

type TranslateFn = (key: string, options?: Record<string, unknown>) => string

export const getHeaderTitle = (
  activeTab: Tab | undefined,
  t: TranslateFn,
  role?: UiRole | null
) => {
  if (activeTab === 'feed') return t('feed.headerTitle', { defaultValue: 'Лента' })
  if (activeTab === 'activity') {
    if (role === 'venue') return t('tabs.venue.activity', { defaultValue: 'Активность' })
    return t('tabs.employee.activity', { defaultValue: 'Активность' })
  }
  if (activeTab === 'myshifts') return t('tabs.employee.myHeader', { defaultValue: 'Мои смены' })
  if (activeTab === 'profile') {
    if (role === 'venue') return t('tabs.venue.profile', { defaultValue: 'Профиль' })
    return t('tabs.employee.profileShort', { defaultValue: 'Я' })
  }
  if (!activeTab) return ''

  const candidates = [
    `tabs.employee.${activeTab}`,
    `tabs.venue.${activeTab}`,
    `tabs.supplier.${activeTab}`,
  ]
  for (const key of candidates) {
    const v = t(key, { defaultValue: '' })
    if (v) return v
  }
  return ''
}

export const getHeaderAction = (params: {
  activeTab: Tab | undefined
  t: TranslateFn
  onAddShift?: () => void
  role?: UiRole | null
  isEmployeeFlow: boolean
  canEmployeeOfferShift?: boolean
}): HeaderAction | null => {
  const { activeTab, t, onAddShift, role, isEmployeeFlow, canEmployeeOfferShift = true } = params

  const venueAddShiftAction = (): HeaderAction => ({
    ariaLabel: t('feed.venueEmptyCta', {
      defaultValue: 'Создать вакансию или смену',
    }),
    Icon: Plus,
    onClick: () => {
      onAddShift?.()
      emitAppEvent(APP_EVENTS.OPEN_ACTIVITY_ADD_SHIFT)
    },
  })

  if (activeTab === 'feed') {
    if (role === 'venue') {
      return venueAddShiftAction()
    }

    return {
      ariaLabel: t('feed.openFilters', { defaultValue: 'Фильтры' }),
      Icon: SlidersHorizontal,
      onClick: () => emitAppEvent(APP_EVENTS.OPEN_FEED_FILTERS),
    }
  }

  if (activeTab === 'activity' || activeTab === 'myshifts') {
    if (role === 'venue') {
      return venueAddShiftAction()
    }

    if (activeTab === 'myshifts' && isEmployeeFlow && !canEmployeeOfferShift) {
      return {
        ariaLabel: t('shift.editShiftAria', { defaultValue: 'Edit shift' }),
        Icon: Edit2,
        onClick: () => emitAppEvent(APP_EVENTS.OPEN_ACTIVITY_EDIT_SHIFT),
      }
    }

    if (isEmployeeFlow && !canEmployeeOfferShift) {
      return null
    }

    return {
      ariaLabel: isEmployeeFlow ? t('shift.offerShiftAria') : t('shift.addShiftAria'),
      Icon: Plus,
      onClick: () => {
        onAddShift?.()
        emitAppEvent(APP_EVENTS.OPEN_ACTIVITY_ADD_SHIFT)
      },
    }
  }

  if (activeTab === 'profile') {
    return {
      ariaLabel: t('aria.editProfile'),
      Icon: Edit2,
      onClick: () => emitAppEvent(APP_EVENTS.OPEN_PROFILE_EDIT),
    }
  }

  if (activeTab === 'suppliers') {
    return {
      ariaLabel: t('feed.openFilters', { defaultValue: 'Фильтры' }),
      Icon: SlidersHorizontal,
      onClick: () => emitAppEvent(APP_EVENTS.OPEN_SUPPLIERS_FILTERS),
    }
  }

  if (activeTab === 'home' && role === 'supplier') {
    return {
      ariaLabel: t('feed.openFilters', { defaultValue: 'Фильтры' }),
      Icon: SlidersHorizontal,
      onClick: () => emitAppEvent(APP_EVENTS.OPEN_SUPPLIERS_FILTERS),
    }
  }

  return null
}

export const resolveIsEmployeeFlow = (role?: UiRole | null) =>
  role != null && UI_ROLE_TO_API_ROLE[role] === 'employee'
