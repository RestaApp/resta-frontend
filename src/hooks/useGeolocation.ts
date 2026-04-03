/**
 * Хук для определения местоположения пользователя через геолокацию
 * Использует Nominatim API для получения названия города по координатам
 */

import { useState, useCallback, useRef } from 'react'
import { logger } from '@/utils/logger'

interface UseGeolocationReturn {
  getLocation: () => Promise<string | null>
  isLoading: boolean
}

const NOMINATIM_DELAY_MS = 1000 // Минимальный интервал между запросами к Nominatim
const NOMINATIM_TIMEOUT_MS = 8000
const GEOCODE_CACHE_TTL_MS = 10 * 60 * 1000

let lastNominatimRequestAt = 0

const geocodeCache = new Map<string, { city: string | null; ts: number }>()

const toGeocodeCacheKey = (latitude: number, longitude: number): string => {
  return `${latitude.toFixed(3)}:${longitude.toFixed(3)}`
}

const wait = (ms: number): Promise<void> => {
  if (ms <= 0) return Promise.resolve()
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function enforceNominatimRateLimit(): Promise<void> {
  const now = Date.now()
  const elapsed = now - lastNominatimRequestAt
  const remaining = NOMINATIM_DELAY_MS - elapsed
  if (remaining > 0) {
    await wait(remaining)
  }
  lastNominatimRequestAt = Date.now()
}

/**
 * Извлекает название города из ответа Nominatim API
 */
function extractCityFromNominatimResponse(data: unknown): string | null {
  if (!data || typeof data !== 'object' || !('address' in data)) {
    return null
  }

  const address = (data as { address?: Record<string, string> }).address
  if (!address) {
    return null
  }

  // Пробуем разные варианты получения города
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.city_district ||
    address.county ||
    address.state

  if (city) {
    return city
  }

  // Если не нашли город в address, пробуем из display_name
  const displayName = (data as { display_name?: string }).display_name
  if (displayName) {
    const parts = displayName.split(',')
    const foundCity = parts
      .find(
        (part: string) =>
          part.trim().length > 0 &&
          !part.includes('область') &&
          !part.includes('район') &&
          !part.includes('улица')
      )
      ?.trim()

    return foundCity || parts[0]?.trim() || null
  }

  return null
}

/**
 * Получает координаты через Geolocation API
 */
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation не поддерживается'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error: GeolocationPositionError) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Получает название города по координатам через Nominatim API
 */
async function getCityByCoordinates(latitude: number, longitude: number): Promise<string | null> {
  const cacheKey = toGeocodeCacheKey(latitude, longitude)
  const cached = geocodeCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < GEOCODE_CACHE_TTL_MS) {
    return cached.city
  }

  await enforceNominatimRateLimit()

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=ru`
  const abortController = new AbortController()
  const timeoutId = setTimeout(() => {
    abortController.abort()
  }, NOMINATIM_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: abortController.signal,
    })

    if (!response.ok) {
      logger.warn(`Ошибка Nominatim API: status ${response.status}`)
      return null
    }

    const data = await response.json()
    const city = extractCityFromNominatimResponse(data)
    geocodeCache.set(cacheKey, { city, ts: Date.now() })
    return city
  } catch (error) {
    // Ошибка сети или CORS
    logger.warn('Не удалось получить город из API (возможно, проблема с CORS):', error)
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Проверяет, является ли ошибка ошибкой геолокации
 */
function isGeolocationError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    (error.code === 1 || error.code === 2 || error.code === 3)
  )
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const isLoadingRef = useRef(false)

  const getLocation = useCallback(async (): Promise<string | null> => {
    // Защита от повторных запросов
    if (isLoadingRef.current) {
      return null
    }

    isLoadingRef.current = true
    setIsLoading(true)

    try {
      // Получаем координаты
      const position = await getCurrentPosition()
      const { latitude, longitude } = position.coords

      // Получаем название города по координатам
      const city = await getCityByCoordinates(latitude, longitude)

      return city
    } catch (error) {
      // Проверяем, является ли это ошибкой геолокации
      if (isGeolocationError(error)) {
        // Пользователь отклонил доступ или геолокация недоступна
        // Не логируем, просто возвращаем null
        return null
      }

      // Логируем только неожиданные ошибки
      logger.warn('Ошибка определения местоположения:', error)
      return null
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
    }
  }, [])

  return {
    getLocation,
    isLoading,
  }
}
