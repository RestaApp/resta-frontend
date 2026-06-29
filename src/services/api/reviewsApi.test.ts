import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { api } from '@/shared/api/api'
import { notificationsApi } from './notificationsApi'
import { reviewsApi } from './reviewsApi'

vi.mock('@/services/auth', () => ({
  authService: { getToken: () => null, logout: vi.fn() },
}))

const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: gDM => gDM().concat(api.middleware),
  })

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

const urlOf = (input: RequestInfo | URL): string =>
  typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

const fetchMock = vi.fn()
beforeEach(() => {
  vi.clearAllMocks()
  globalThis.fetch = fetchMock as never
})

const notificationsCalls = () =>
  fetchMock.mock.calls.filter(([input]) => urlOf(input).includes('/api/v1/notifications')).length

describe('createReview — инвалидация уведомлений', () => {
  // Бэк при POST /reviews авто-архивирует напоминание review_reminder; фронт должен
  // инвалидировать тег 'Notification', чтобы инбокс/колокол обновились сразу.
  it('перезапрашивает список уведомлений после успешного создания отзыва', async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      if (urlOf(input).includes('/api/v1/notifications')) {
        return jsonResponse({ success: true, data: [], meta: { has_unread: false } })
      }
      return jsonResponse({
        success: true,
        data: { id: 1, rating: 5, comment: null, status: 'approved' },
      })
    })

    const store = makeStore()
    // Активная подписка — без неё инвалидация тега не вызовет рефетч.
    const sub = store.dispatch(notificationsApi.endpoints.getNotifications.initiate())
    await sub
    expect(notificationsCalls()).toBe(1)

    await store.dispatch(
      reviewsApi.endpoints.createReview.initiate({ reviewedId: 7, shiftId: 42, rating: 5 })
    )

    await vi.waitFor(() => expect(notificationsCalls()).toBe(2))

    sub.unsubscribe()
  })
})
