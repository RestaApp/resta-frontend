import { fetchBaseQuery, retry, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { API_BASE_URL } from './config'
import { authService } from '@/services/auth'
import { clearUserData } from '@/features/navigation/model/userSlice'
import { api } from '@/shared/api/api'

export const tagTypes = [
  'Shift',
  'Vacancy',
  'Application',
  'AppliedShift',
  'Notification',
  'User',
  'Profile',
  'Supplier',
  'Venue',
  'News',
  'Catalog',
] as const

export type TagType = (typeof tagTypes)[number]

export const rtkQueryConfig = {
  baseUrl: API_BASE_URL,
  keepUnusedDataFor: 60,
  refetchOnMountOrArgChange: 30,
  refetchOnFocus: true,
  refetchOnReconnect: true,
} as const

type Args = string | FetchArgs

const rawBaseQuery = fetchBaseQuery({
  baseUrl: rtkQueryConfig.baseUrl,
  prepareHeaders: (headers) => {
    const token = authService.getToken()
    if (token) headers.set('authorization', `Bearer ${token}`)

    headers.set('x-client-version', import.meta.env.VITE_APP_VERSION || '1.0.0')
    headers.set('x-client-platform', 'web')

    return headers
  },
})

let refreshPromise: Promise<boolean> | null = null

const refreshToken = async (): Promise<boolean> => {
  const refreshTokenValue = authService.getRefreshToken()
  if (!refreshTokenValue) return false

  try {
    const res = await fetch(`${rtkQueryConfig.baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    })

    if (!res.ok) return false

    const data = (await res.json()) as { accessToken: string; refreshToken: string }
    authService.setTokens(data.accessToken, data.refreshToken)

    return true
  } catch {
    return false
  }
}

const baseQueryWithReauth: BaseQueryFn<Args, unknown, FetchBaseQueryError> = async (args, apiCtx, extraOptions) => {
  const result = await rawBaseQuery(args, apiCtx, extraOptions)
  if (result.error?.status !== 401) return result

  if (!refreshPromise) {
    refreshPromise = refreshToken().finally(() => {
      refreshPromise = null
    })
  }

  const ok = await refreshPromise

  if (ok) {
    return rawBaseQuery(args, apiCtx, extraOptions)
  }

  authService.logout()
  apiCtx.dispatch(clearUserData())
  apiCtx.dispatch(api.util.resetApiState())

  return result
}

// Ретраим только сетевые/5xx и типичные временные
export const baseQuery = retry(baseQueryWithReauth, {
  maxRetries: 2,
})