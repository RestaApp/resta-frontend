/**
 * Хелперы для RTK Query endpoints
 * Устраняют дублирование кода и обеспечивают единообразие
 */

import type { EndpointBuilder, BaseQueryFn } from '@reduxjs/toolkit/query'
import type { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'
import type { FetchArgs } from '@reduxjs/toolkit/query'

/**
 * Тип для CustomBaseQuery из конфигурации RTK Query
 */
type CustomBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  Record<string, unknown>,
  FetchBaseQueryMeta
>

/**
 * Конфигурация для catalog endpoints (справочные данные)
 * Справочные данные кешируются дольше, так как они редко меняются
 */
export const CATALOG_ENDPOINT_CONFIG = {
  providesTags: ['Catalog'] as const,
  keepUnusedDataFor: 3600, // Кэшировать данные 1 час (справочные данные редко меняются)
} as const

/**
 * Создает стандартный catalog query endpoint
 * Используется для справочных данных (роли, позиции, специализации и т.д.)
 */
export function createCatalogQuery<
  TResponse,
  TQueryArg = void,
>(
  builder: EndpointBuilder<CustomBaseQuery, 'Catalog' | 'User' | 'Shift' | 'Vacancy' | 'Application' | 'Notification' | 'Profile' | 'Supplier' | 'Venue' | 'News', 'api'>,
  config: {
    url: string
    method?: 'GET' | 'POST'
  }
) {
  return builder.query<TResponse, TQueryArg>({
    query: () => ({
      url: config.url,
      method: config.method || 'GET',
    }),
    ...CATALOG_ENDPOINT_CONFIG,
  })
}

/**
 * Утилита для построения query параметров из объекта
 * Обрабатывает массивы, булевы значения и опциональные параметры
 */
export function buildQueryParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    // Пропускаем undefined и null значения
    if (value === undefined || value === null) {
      return
    }

    // Обрабатываем массивы
    if (Array.isArray(value)) {
      if (value.length > 0) {
        value.forEach(item => {
          searchParams.append(`${key}[]`, String(item))
        })
      }
      return
    }

    // Обрабатываем булевы значения
    if (typeof value === 'boolean') {
      searchParams.append(key, String(value))
      return
    }

    // Обрабатываем остальные типы
    searchParams.append(key, String(value))
  })

  return searchParams.toString()
}

