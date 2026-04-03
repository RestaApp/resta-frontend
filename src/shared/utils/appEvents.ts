export const APP_EVENTS = {
  AUTH_AUTHORIZED: 'auth:authorized',
  AUTH_UNAUTHORIZED: 'auth:unauthorized',
  AUTH_LOGOUT: 'auth:logout',
  OPEN_PROFILE_EDIT: 'openProfileEdit',
  OPEN_ACTIVITY_ADD_SHIFT: 'openActivityAddShift',
  OPEN_ACTIVITY_EDIT_SHIFT: 'openActivityEditShift',
  OPEN_FEED_FILTERS: 'openFeedFilters',
  OPEN_SUPPLIERS_FILTERS: 'openSuppliersFilters',
  SHOW_ACTIVITY_ADD_SHIFT_ONBOARDING: 'showActivityAddShiftOnboarding',
  SET_VENUE_CREATE_TYPE: 'setVenueCreateType',
} as const

type AppEventName = (typeof APP_EVENTS)[keyof typeof APP_EVENTS]

type AppEventDetailMap = {
  [APP_EVENTS.AUTH_AUTHORIZED]: undefined
  [APP_EVENTS.AUTH_UNAUTHORIZED]: undefined
  [APP_EVENTS.AUTH_LOGOUT]: undefined
  [APP_EVENTS.OPEN_PROFILE_EDIT]: undefined
  [APP_EVENTS.OPEN_ACTIVITY_ADD_SHIFT]: undefined
  [APP_EVENTS.OPEN_ACTIVITY_EDIT_SHIFT]: { shift?: unknown } | undefined
  [APP_EVENTS.OPEN_FEED_FILTERS]: undefined
  [APP_EVENTS.OPEN_SUPPLIERS_FILTERS]: undefined
  [APP_EVENTS.SHOW_ACTIVITY_ADD_SHIFT_ONBOARDING]: undefined
  [APP_EVENTS.SET_VENUE_CREATE_TYPE]: { type?: 'vacancy' | 'replacement' } | undefined
}

export const emitAppEvent = <K extends AppEventName>(
  name: K,
  detail?: AppEventDetailMap[K]
): void => {
  if (typeof window === 'undefined') return

  if (detail === undefined) {
    window.dispatchEvent(new Event(name))
    return
  }

  window.dispatchEvent(new CustomEvent(name, { detail }))
}

export const onAppEvent = <K extends AppEventName>(
  name: K,
  handler: (detail: AppEventDetailMap[K]) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => void 0

  const listener: EventListener = (event: Event) => {
    const customEvent = event as CustomEvent<AppEventDetailMap[K]>
    const detail = (
      'detail' in customEvent ? customEvent.detail : undefined
    ) as AppEventDetailMap[K]
    handler(detail)
  }

  window.addEventListener(name, listener)
  return () => {
    window.removeEventListener(name, listener)
  }
}
