/**
 * Единая логика для работы с API эндпоинтами
 */

const API_URL = import.meta.env.VITE_API_URL

export interface ApiError {
  message: string
  status?: number
  data?: unknown
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>
}

/**
 * Формирует URL с query параметрами
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  if (!params || Object.keys(params).length === 0) {
    return url
  }

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `${url}?${queryString}` : url
}

/**
 * Обрабатывает ответ от сервера
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      errorData = await response.text()
    }

    const error: ApiError = {
      message: `HTTP error! status: ${response.status}`,
      status: response.status,
      data: errorData,
    }

    throw error
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return await response.json()
  }

  return (await response.text()) as T
}

/**
 * Выполняет GET запрос
 */
export async function get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
  try {
    const { params, ...fetchConfig } = config || {}
    const url = buildUrl(endpoint, params)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...fetchConfig.headers,
      },
      ...fetchConfig,
    })

    return await handleResponse<T>(response)
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error
    }
    throw {
      message: 'Ошибка выполнения запроса',
      data: error,
    } as ApiError
  }
}

/**
 * Выполняет POST запрос
 */
export async function post<T>(
  endpoint: string,
  data?: unknown,
  config?: RequestConfig
): Promise<T> {
  try {
    const { params, ...fetchConfig } = config || {}
    const url = buildUrl(endpoint, params)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...fetchConfig.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...fetchConfig,
    })

    return await handleResponse<T>(response)
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error
    }
    throw {
      message: 'Ошибка выполнения запроса',
      data: error,
    } as ApiError
  }
}

/**
 * Выполняет PUT запрос
 */
export async function put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
  try {
    const { params, ...fetchConfig } = config || {}
    const url = buildUrl(endpoint, params)

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...fetchConfig.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...fetchConfig,
    })

    return await handleResponse<T>(response)
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error
    }
    throw {
      message: 'Ошибка выполнения запроса',
      data: error,
    } as ApiError
  }
}

/**
 * Выполняет PATCH запрос
 */
export async function patch<T>(
  endpoint: string,
  data?: unknown,
  config?: RequestConfig
): Promise<T> {
  try {
    const { params, ...fetchConfig } = config || {}
    const url = buildUrl(endpoint, params)

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...fetchConfig.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...fetchConfig,
    })

    return await handleResponse<T>(response)
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error
    }
    throw {
      message: 'Ошибка выполнения запроса',
      data: error,
    } as ApiError
  }
}

/**
 * Выполняет DELETE запрос
 */
export async function del<T>(endpoint: string, config?: RequestConfig): Promise<T> {
  try {
    const { params, ...fetchConfig } = config || {}
    const url = buildUrl(endpoint, params)

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...fetchConfig.headers,
      },
      ...fetchConfig,
    })

    return await handleResponse<T>(response)
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error
    }
    throw {
      message: 'Ошибка выполнения запроса',
      data: error,
    } as ApiError
  }
}
