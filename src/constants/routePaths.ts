import type { Screen, UiRole } from '@/types'
import { isEmployeeRole } from '@/utils/roles'

const EMPLOYEE_SCREEN_PATHS: Partial<Record<Screen, string>> = {
  home: '/feed',
  shifts: '/applications',
  vacancies: '/applications',
  profile: '/me',
  settings: '/settings',
}

const VENUE_SCREEN_PATHS: Partial<Record<Screen, string>> = {
  home: '/home',
  shifts: '/shifts',
  applications: '/applicants',
  suppliers: '/suppliers',
  profile: '/venue',
  settings: '/venue',
}

const SUPPLIER_SCREEN_PATHS: Partial<Record<Screen, string>> = {
  home: '/venues',
  profile: '/me',
  settings: '/me',
}

/**
 * Порядок экранов задаёт разрешение коллизий «несколько Screen → один URL»:
 * для каждого пути побеждает первый в списке экран, у которого этот путь в карте выше.
 */
const EMPLOYEE_SCREEN_ORDER: Screen[] = ['home', 'shifts', 'vacancies', 'profile', 'settings']

const VENUE_SCREEN_ORDER: Screen[] = [
  'home',
  'shifts',
  'applications',
  'suppliers',
  'profile',
  'settings',
]

const SUPPLIER_SCREEN_ORDER: Screen[] = ['home', 'profile', 'settings']

function buildPathToScreenLookup(
  forward: Partial<Record<Screen, string>>,
  collisionPriority: readonly Screen[]
): Map<string, Screen> {
  const pathToScreen = new Map<string, Screen>()
  for (const screen of collisionPriority) {
    const path = forward[screen]
    if (path == null) continue
    if (!pathToScreen.has(path)) {
      pathToScreen.set(path, screen)
    }
  }
  return pathToScreen
}

const EMPLOYEE_PATH_TO_SCREEN = buildPathToScreenLookup(
  EMPLOYEE_SCREEN_PATHS,
  EMPLOYEE_SCREEN_ORDER
)
const VENUE_PATH_TO_SCREEN = buildPathToScreenLookup(VENUE_SCREEN_PATHS, VENUE_SCREEN_ORDER)
const SUPPLIER_PATH_TO_SCREEN = buildPathToScreenLookup(
  SUPPLIER_SCREEN_PATHS,
  SUPPLIER_SCREEN_ORDER
)

const normalizePathname = (pathname: string): string => {
  const clean = pathname.trim()
  if (!clean) return '/'
  if (clean === '/') return clean
  return clean.endsWith('/') ? clean.slice(0, -1) : clean
}

const getPathMapForRole = (role: UiRole): Partial<Record<Screen, string>> => {
  if (isEmployeeRole(role)) return EMPLOYEE_SCREEN_PATHS
  if (role === 'venue') return VENUE_SCREEN_PATHS
  return SUPPLIER_SCREEN_PATHS
}

const getPathToScreenLookupForRole = (role: UiRole): Map<string, Screen> => {
  if (isEmployeeRole(role)) return EMPLOYEE_PATH_TO_SCREEN
  if (role === 'venue') return VENUE_PATH_TO_SCREEN
  return SUPPLIER_PATH_TO_SCREEN
}

export const getPathForScreen = (role: UiRole, screen: Screen): string => {
  const map = getPathMapForRole(role)
  return map[screen] ?? '/'
}

export const getScreenForPath = (role: UiRole, pathname: string): Screen | null => {
  const path = normalizePathname(pathname)
  const lookup = getPathToScreenLookupForRole(role)
  return lookup.get(path) ?? null
}
