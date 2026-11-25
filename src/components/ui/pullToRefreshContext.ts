import { createContext } from 'react'

export interface PullToRefreshRegistration {
  onRefresh: () => Promise<unknown> | void
  /** Обновление сейчас недоступно (идёт загрузка) — тяга только пружинит. */
  disabled: boolean
}

/** Регистрирует обновление экрана по тяге; возвращает функцию отмены регистрации. */
export type RegisterPullToRefresh = (registration: PullToRefreshRegistration) => () => void

/**
 * Связывает экран (`PullToRefresh`) с оболочкой страницы (`PageOverscroll`),
 * которая владеет жестом. Вне оболочки регистрация ничего не делает.
 */
export const PullToRefreshContext = createContext<RegisterPullToRefresh>(() => () => undefined)
