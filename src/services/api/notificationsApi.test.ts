import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { api } from '@/shared/api/api'
import {
  notificationsApi,
  type NotificationItem,
  type NotificationsListResponse,
} from './notificationsApi'

vi.mock('@/services/auth', () => ({
  authService: { getToken: () => null, logout: vi.fn() },
}))

const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: gDM => gDM().concat(api.middleware),
  })

const item = (id: number, status: NotificationItem['status']): NotificationItem => ({
  id,
  title: `n${id}`,
  message: 'm',
  notification_type: 'system_message',
  status,
  created_at: '2026-01-01T00:00:00Z',
  read_at: null,
  notifiable_type: null,
  notifiable_id: null,
})

// upsertQueryData асинхронен — обязательно await, иначе оптимистичный патч
// сработает до записи кэша (no-op) и тест увидит исходные значения.
const seed = async (
  store: ReturnType<typeof makeStore>,
  items: NotificationItem[],
  hasUnread: boolean
) => {
  const list: NotificationsListResponse = {
    success: true,
    data: items,
    meta: { has_unread: hasUnread },
  }
  await Promise.all([
    store.dispatch(notificationsApi.util.upsertQueryData('getNotifications', undefined, list)),
    store.dispatch(
      notificationsApi.util.upsertQueryData('getHasUnread', undefined, {
        success: true,
        data: { has_unread: hasUnread },
      })
    ),
  ])
}

const selectList = (store: ReturnType<typeof makeStore>) =>
  notificationsApi.endpoints.getNotifications.select(undefined)(store.getState()).data?.data
const selectHasUnread = (store: ReturnType<typeof makeStore>) =>
  notificationsApi.endpoints.getHasUnread.select(undefined)(store.getState()).data?.data.has_unread

const fetchMock = vi.fn()
beforeEach(() => {
  vi.clearAllMocks()
  globalThis.fetch = fetchMock as never
})
// Свежий Response на каждый вызов (тело читается один раз — иначе ретраи падают).
const ok = () =>
  fetchMock.mockImplementation(
    async () =>
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
  )
// Сетевой сбой не ретраится (shouldRetry → false) → мутация отклоняется сразу.
const fail = () => fetchMock.mockRejectedValue(new TypeError('network down'))

describe('markNotificationRead (optimistic)', () => {
  it('успех: помечает прочитанным и гасит has_unread, когда непрочитанных не осталось', async () => {
    ok()
    const store = makeStore()
    await seed(store, [item(1, 'unread'), item(2, 'read')], true)

    await store.dispatch(notificationsApi.endpoints.markNotificationRead.initiate(1))

    expect(selectList(store)?.find(n => n.id === 1)?.status).toBe('read')
    expect(selectHasUnread(store)).toBe(false)
  })

  it('успех: has_unread остаётся true, если есть другой непрочитанный', async () => {
    ok()
    const store = makeStore()
    await seed(store, [item(1, 'unread'), item(2, 'unread')], true)

    await store.dispatch(notificationsApi.endpoints.markNotificationRead.initiate(1))

    expect(selectList(store)?.find(n => n.id === 1)?.status).toBe('read')
    expect(selectList(store)?.find(n => n.id === 2)?.status).toBe('unread')
    expect(selectHasUnread(store)).toBe(true)
  })

  it('ошибка: оптимистичный патч откатывается', async () => {
    fail()
    const store = makeStore()
    await seed(store, [item(1, 'unread'), item(2, 'read')], true)

    await store.dispatch(notificationsApi.endpoints.markNotificationRead.initiate(1))

    expect(selectList(store)?.find(n => n.id === 1)?.status).toBe('unread')
    expect(selectHasUnread(store)).toBe(true)
  })
})

describe('markAllNotificationsRead (optimistic)', () => {
  it('успех: все unread → read, has_unread → false', async () => {
    ok()
    const store = makeStore()
    await seed(store, [item(1, 'unread'), item(2, 'unread')], true)

    await store.dispatch(notificationsApi.endpoints.markAllNotificationsRead.initiate())

    expect(selectList(store)?.every(n => n.status === 'read')).toBe(true)
    expect(selectHasUnread(store)).toBe(false)
  })

  it('ошибка: откат к unread', async () => {
    fail()
    const store = makeStore()
    await seed(store, [item(1, 'unread'), item(2, 'unread')], true)

    await store.dispatch(notificationsApi.endpoints.markAllNotificationsRead.initiate())

    expect(selectList(store)?.every(n => n.status === 'unread')).toBe(true)
    expect(selectHasUnread(store)).toBe(true)
  })
})
