/**
 * Хелперы для RTK Query endpoints
 * Устраняют дублирование кода и обеспечивают единообразие
 */

import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import type { EndpointBuilder } from '@reduxjs/toolkit/query/react'
import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { TagType } from '@/shared/api/rtkQuery'

type ApiEndpointBuilder = EndpointBuilder<
  BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
  TagType,
  'api'
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
export function createCatalogQuery<TResponse, TQueryArg = void>(
  builder: ApiEndpointBuilder,
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

type Primitive = string | number | boolean | null | undefined | Date
type QueryValue = Primitive | Primitive[]

type ArrayFormat = 'brackets' | 'repeat'

export interface BuildQueryParamsOptions {
  arrayFormat?: ArrayFormat
}

/**
 * Утилита для построения query параметров из объекта.
 * Поддержка массивов (brackets или repeat), Date (toISOString), примитивов.
 * Принимает любой объект (в т.ч. GetVacanciesParams) без каста на месте вызова.
 */
export function buildQueryParams(
  params: object,
  opts: BuildQueryParamsOptions = {}
): string {
  const { arrayFormat = 'brackets' } = opts
  const sp = new URLSearchParams()

  const append = (k: string, v: Primitive) => {
    if (v === undefined || v === null) return
    if (v instanceof Date) sp.append(k, v.toISOString())
    else sp.append(k, String(v))
  }

  for (const [key, raw] of Object.entries(params)) {
    const value = raw as QueryValue | undefined
    if (value === undefined || value === null) continue

    if (Array.isArray(value)) {
      if (!value.length) continue
      for (const v of value) {
        append(arrayFormat === 'brackets' ? `${key}[]` : key, v)
      }
      continue
    }

    append(key, value)
  }

  return sp.toString()
}

/**
 * Теги для списков RTK Query: LIST + по одному тегу на элемент по id.
 * Точечная инвалидация вместо рефетча всего при любом изменении.
 */
export function provideListTags<T extends { id: number | string }>(
  type: 'Shift' | 'AppliedShift',
  result?: { data?: T[] } | T[]
) {
  const items = Array.isArray(result) ? result : result?.data
  return items?.length
    ? [
        { type, id: 'LIST' as const },
        ...items.map(i => ({ type, id: i.id })),
      ]
    : [{ type, id: 'LIST' as const }]
}

