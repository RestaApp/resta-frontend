/**
 * Конфигурация RTK Query
 * Настройки кэширования, обновлений и обработки ошибок
 */

import {
  createApi as createRTKApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react'

import { API_BASE_URL } from './api'
import { authService } from '@/services/auth'

/**
 * Типы для конфигурации
 */
type TagType =
  | 'Shift'
  | 'Vacancy'
  | 'Application'
  | 'AppliedShift'
  | 'Notification'
  | 'User'
  | 'Profile'
  | 'Supplier'
  | 'Venue'
  | 'News'
  | 'Catalog'

/**
 * Настройки RTK Query
 */
export const rtkQueryConfig = {
  // Базовые настройки
  reducerPath: 'api' as const,
  baseUrl: API_BASE_URL,

  // Настройки кэширования
  keepUnusedDataFor: 60, // Кэшировать неиспользуемые данные 60 секунд
  refetchOnMountOrArgChange: 30, // Обновлять при монтировании или изменении аргументов через 30 секунд
  refetchOnFocus: true, // Обновлять при фокусе на окне
  refetchOnReconnect: true, // Обновлять при восстановлении соединения

  // Настройки тагов для инвалидации кэша
  tagTypes: [
    'Shift',
    'Vacancy',
    'Application',
    'AppliedShift', // Смены с поданными заявками
    'Notification',
    'User',
    'Profile',
    'Supplier',
    'Venue',
    'News',
    'Catalog', // Справочные данные (роли, позиции, специализации и т.д.)
  ] as const satisfies readonly TagType[],

  // Настройки кэша ошибок
  errorCache: {
    maxSize: 100, // Максимальное количество закэшированных ошибок
    ttl: 60 * 1000, // Время жизни кэша ошибок (1 минута)
    cleanupInterval: 5 * 60 * 1000, // Интервал очистки старых записей (5 минут)
  },
} as const

/**
 * Тип для закэшированной ошибки
 */
interface CachedError {
  timestamp: number
  error: FetchBaseQueryError
}

/**
 * Кэш для отслеживания ошибок запросов
 * Используется для предотвращения бесконечных повторных попыток
 */
class ErrorCache {
  private cache = new Map<string, CachedError>()
  private lastCleanup = Date.now()

  /**
   * Создает ключ для кэша ошибок на основе аргументов запроса
   */
  private getKey(args: string | FetchArgs): string {
    if (typeof args === 'string') {
      return args
    }
    if (args && typeof args === 'object') {
      // Нормализуем URL для одинаковых запросов
      const url = args.url || ''
      const method = args.method || 'GET'
      const body = args.body ? JSON.stringify(args.body) : ''
      return `${method}:${url}:${body}`
    }
    return String(args)
  }

  /**
   * Получает закэшированную ошибку
   */
  get(args: string | FetchArgs): CachedError | undefined {
    this.cleanupIfNeeded()
    return this.cache.get(this.getKey(args))
  }

  /**
   * Сохраняет ошибку в кэш
   */
  set(args: string | FetchArgs, error: FetchBaseQueryError): void {
    this.cleanupIfNeeded()

    // Ограничиваем размер кэша
    if (this.cache.size >= rtkQueryConfig.errorCache.maxSize) {
      // Удаляем самую старую запись
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(this.getKey(args), {
      timestamp: Date.now(),
      error,
    })
  }

  /**
   * Удаляет ошибку из кэша
   */
  delete(args: string | FetchArgs): void {
    this.cache.delete(this.getKey(args))
  }

  /**
   * Очищает старые записи из кэша
   */
  private cleanupIfNeeded(): void {
    const now = Date.now()

    // Очищаем только раз в определенный интервал
    if (now - this.lastCleanup < rtkQueryConfig.errorCache.cleanupInterval) {
      return
    }

    this.lastCleanup = now
    const maxAge = rtkQueryConfig.errorCache.ttl
    const keysToDelete: string[] = []

    this.cache.forEach((value, key) => {
      if (now - value.timestamp > maxAge) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => {
      this.cache.delete(key)
    })
  }

  /**
   * Очищает весь кэш
   */
  clear(): void {
    this.cache.clear()
    this.lastCleanup = Date.now()
  }
}

const errorCache = new ErrorCache()

/**
 * Тип для расширенного BaseQuery
 */
type CustomBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  Record<string, unknown>,
  FetchBaseQueryMeta
>

/**
 * Логика повторных попыток для запросов
 */
const retryLogic = (failureCount: number, error: FetchBaseQueryError | undefined): boolean => {
  if (!error) {
    return failureCount < 1
  }

  const status = error.status

  // Не повторяем запросы для 4xx ошибок (кроме 408, 429)
  if (
    typeof status === 'number' &&
    status >= 400 &&
    status < 500 &&
    status !== 408 &&
    status !== 429
  ) {
    return false
  }

  // Повторяем максимум 2 раза для 5xx ошибок (всего 3 попытки включая первую)
  if (typeof status === 'number' && status >= 500) {
    return failureCount < 2
  }

  // Для сетевых ошибок и других - максимум 1 повтор (всего 2 попытки)
  return failureCount < 1
}

/**
 * Задержка между повторными попытками
 */
const retryDelay = (attemptIndex: number): number => {
  // Экспоненциальная задержка: 1s, 2s, 4s... максимум 10s
  return Math.min(1000 * 2 ** attemptIndex, 10000)
}

/**
 * Подготовка заголовков запроса
 */
const prepareHeaders = (headers: Headers): Headers => {
  // Добавляем токен авторизации
  const token = authService.getToken()

  if (token) {
    headers.set('authorization', `Bearer ${token}`)
  }

  // Добавляем заголовки для отслеживания
  headers.set('x-client-version', import.meta.env.VITE_APP_VERSION || '1.0.0')
  headers.set('x-client-platform', 'web')

  // fetchBaseQuery автоматически устанавливает content-type и accept
  // для JSON, поэтому не нужно устанавливать их вручную
  return headers
}

/**
 * Обработка ошибки авторизации (401)
 * Пытается обновить токен, если есть refresh token
 */
const handleAuthError = async (): Promise<boolean> => {
  const refreshToken = authService.getRefreshToken()

  // Если есть refresh token, пытаемся обновить
  if (refreshToken) {
    try {
      // Используем прямой fetch для обновления токена, чтобы избежать циклических зависимостей
      const refreshUrl = `${rtkQueryConfig.baseUrl}/api/v1/auth/refresh`
      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = (await response.json()) as { accessToken: string; refreshToken: string }
        authService.setTokens(data.accessToken, data.refreshToken)
        return true // Токен обновлен
      }
    } catch {
      // Игнорируем ошибки при обновлении токена
    }
  }

  // Если обновление не удалось - выходим
  authService.logout()
  errorCache.clear()

  // Очищаем данные пользователя из Redux
  // Используем событие, чтобы компоненты могли очистить Redux
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      // Также отправляем событие для очистки Redux
      window.dispatchEvent(new CustomEvent('auth:logout'))
    } catch {
      // Игнорируем ошибки при отправке события
    }
  }

  return false // Токен не обновлен
}

/**
 * Проверяет, нужно ли кэшировать ошибку
 */
const shouldCacheError = (error: FetchBaseQueryError): boolean => {
  const status = error.status

  // Кэшируем только критические ошибки
  if (typeof status === 'number' && status >= 400) {
    return true
  }

  // Кэшируем сетевые и парсинг ошибки
  return status === 'FETCH_ERROR' || status === 'PARSING_ERROR' || status === 'TIMEOUT_ERROR'
}

/**
 * Создает оптимизированный baseQuery с обработкой ошибок
 * Предотвращает бесконечные повторные попытки при ошибках
 */
export const createBaseQuery = (): CustomBaseQuery => {
  const baseQuery = fetchBaseQuery({
    baseUrl: rtkQueryConfig.baseUrl,
    prepareHeaders,
  })

  return async (args, api, extraOptions) => {
    // Проверяем, была ли недавняя ошибка для этого запроса
    const cachedError = errorCache.get(args)

    // Для явного повторного запроса (через refetch()) используем флаг
    // RTK Query передает skipToken или другие флаги для пропуска кэша
    const isForcedRefetch =
      extraOptions?.skipToken !== undefined ||
      (extraOptions as Record<string, unknown>)?.forceRefetch === true

    if (cachedError && !isForcedRefetch) {
      const timeSinceError = Date.now() - cachedError.timestamp

      // Если ошибка была недавно, не повторяем автоматически
      if (timeSinceError < rtkQueryConfig.errorCache.ttl) {
        return {
          error: {
            ...cachedError.error,
            status: (cachedError.error.status as string | number) || 'CACHED_ERROR',
            data: cachedError.error.data || {
              message: 'Предыдущий запрос завершился с ошибкой',
            },
          } as FetchBaseQueryError,
          data: undefined,
        }
      }
    }

    // Выполняем запрос
    const result = await baseQuery(args, api, {
      ...extraOptions,
      retry: retryLogic,
      retryDelay,
    })

    // Обрабатываем результат
    if (result.error) {
      const errorStatus = result.error.status

      // Обрабатываем ошибку авторизации
      if (typeof errorStatus === 'number' && errorStatus === 401) {
        const tokenRefreshed = await handleAuthError()

        // Если токен был обновлен, повторяем запрос
        if (tokenRefreshed) {
          // Очищаем кэш ошибки для этого запроса
          errorCache.delete(args)

          // Повторяем запрос с новым токеном
          return await baseQuery(args, api, {
            ...extraOptions,
            retry: retryLogic,
            retryDelay,
          })
        }
      }

      // Кэшируем ошибку для предотвращения автоматического refetch
      if (shouldCacheError(result.error)) {
        errorCache.set(args, result.error)
      }
    } else {
      // Если запрос успешен, удаляем ошибку из кэша
      errorCache.delete(args)
    }

    return result
  }
}

/**
 * Создает оптимизированный RTK Query API
 */
export const createApi = () => {
  return createRTKApi({
    reducerPath: rtkQueryConfig.reducerPath,
    baseQuery: createBaseQuery(),
    tagTypes: rtkQueryConfig.tagTypes,
    keepUnusedDataFor: rtkQueryConfig.keepUnusedDataFor,
    refetchOnMountOrArgChange: rtkQueryConfig.refetchOnMountOrArgChange,
    refetchOnFocus: rtkQueryConfig.refetchOnFocus,
    refetchOnReconnect: rtkQueryConfig.refetchOnReconnect,
    endpoints: () => ({}),
  })
}

/**
 * Типы для экспорта
 */
export type RTKQueryApi = ReturnType<typeof createApi>

/**
 * Утилиты для работы с кэшем ошибок
 * Экспортируются для использования в других частях приложения
 */
export const errorCacheUtils = {
  /**
   * Очищает весь кэш ошибок
   */
  clear: () => errorCache.clear(),

  /**
   * Очищает ошибку для конкретного запроса
   */
  clearForRequest: (args: string | FetchArgs) => errorCache.delete(args),
}
