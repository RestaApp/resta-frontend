/**
 * API для авторизации через Telegram
 * Содержит только определения endpoints (RTK Query)
 * Бизнес-логика вынесена в хуки
 */

import { api } from '@/shared/api/api'
import { applyAuthRefreshPayload } from '@/shared/api/authRefresh'

export interface TelegramAuthRequest {
  initData: string
}

export interface EmployeeProfile {
  experience_years: number
  open_to_work: boolean
  position: string
  skills: string[]
  specializations: string[]
}

export interface RestaurantProfile {
  name?: string | null
  restaurant_format?: string | null
  city?: string | null
}

export interface SupplierProfile {
  supplier_category?: string | null
  supplier_types?: string[] | null
  supplier_type?: string | null
  delivery_available?: boolean | null
  name?: string | null
}

export interface UserData {
  id: number
  active: boolean
  average_rating: number
  bio: string | null
  certifications?: string[]
  /** Есть в полном профиле; в кратких Blueprinter-ответах может отсутствовать */
  created_at?: string
  email: string | null
  employee_profile: EmployeeProfile | null
  /** Название заведения и формат — см. PATCH restaurant_profile_attributes */
  restaurant_profile?: RestaurantProfile | null
  supplier_profile?: SupplierProfile | null
  supplier_profile_attributes?: SupplierProfile | null
  full_name: string
  language: string
  /** Только для employee в Blueprinter */
  last_name?: string
  location: string | null
  city?: string | null
  name: string
  phone: string | null
  photo_url: string | null
  /** Не входит в UserBlueprint для списков */
  profile_complete?: boolean
  profile_photo_url: string | null
  role: string
  telegram_id: number
  total_reviews: number
  updated_at?: string
  username: string
  website: string | null
  /** Расписание работы заведения (ключи — дни или служебные поля вроде schedule) */
  business_hours?: Record<string, string> | null
  work_experience_summary: string | null
  work_preferences: Record<string, unknown>
  // Опциональные поля, которые могут отсутствовать в ответе
  available_for_work?: boolean
  experience_years?: number
  position?: string
  service_categories?: unknown[]
  service_categories_list?: string | null
  specialization?: string | null
}

export interface SignInResponse {
  success: boolean
  data: {
    id: number
    role: string
  }
  meta: {
    token: string
  }
}

export interface AuthResponse {
  success: boolean
  data: UserData
  meta: {
    token: string
  }
}

/** Успешный refresh (тело ответа разбирается в transformResponse) */
export interface RefreshTokenResponse {
  ok: true
}

const authApi = api.injectEndpoints({
  endpoints: builder => ({
    // Авторизация через Telegram
    authTelegram: builder.mutation<SignInResponse, TelegramAuthRequest>({
      query: body => ({
        url: '/api/v1/auth/sign_in',
        method: 'POST',
        // API.md: `init_data`; часть деплоев Rails принимает `initData` (как в Telegram WebApp) — шлём оба.
        body: { init_data: body.initData, initData: body.initData },
      }),
      // Не инвалидируем теги 'User' при sign_in, чтобы избежать лишнего refetch
      // (userData обновляется вручную в хуке authTelegram)
    }),

    // POST /api/v1/auth/refresh — только Bearer; тело запроса не передаём (API.md)
    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => ({
        url: '/api/v1/auth/refresh',
        method: 'POST',
      }),
      transformResponse: (response: unknown): RefreshTokenResponse => {
        if (!applyAuthRefreshPayload(response)) {
          throw new Error('Некорректный ответ refresh')
        }
        return { ok: true }
      },
    }),
  }),
})

// Экспорт базовых хуков RTK Query (используются в кастомных хуках)
export const { useAuthTelegramMutation, useRefreshTokenMutation } = authApi
