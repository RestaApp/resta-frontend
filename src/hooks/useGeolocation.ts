/**
 * Хук для определения местоположения пользователя через геолокацию
 * Использует Nominatim API для получения названия города по координатам
 */

import { useState, useCallback, useRef } from 'react'

interface UseGeolocationReturn {
  getLocation: () => Promise<string | null>
  isLoading: boolean
}

const NOMINATIM_DELAY = 1000 // Задержка для соблюдения rate limit

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
    const foundCity = parts.find(
      (part: string) =>
        part.trim().length > 0 &&
        !part.includes('область') &&
        !part.includes('район') &&
        !part.includes('улица')
    )?.trim()

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
  // Добавляем задержку для соблюдения rate limit
  await new Promise(resolve => setTimeout(resolve, NOMINATIM_DELAY))

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=ru`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      console.warn(`Ошибка Nominatim API: status ${response.status}`)
      return null
    }

    const data = await response.json()
    return extractCityFromNominatimResponse(data)
  } catch (error) {
    // Ошибка сети или CORS
    console.warn('Не удалось получить город из API (возможно, проблема с CORS):', error)
    return null
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
      console.warn('Ошибка определения местоположения:', error)
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


