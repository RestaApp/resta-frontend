import { useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { PullToRefreshContext } from '@/components/ui/pullToRefreshContext'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<unknown> | void
  /** Обновление недоступно (идёт загрузка): тяга только пружинит, без спиннера и запроса. */
  disabled?: boolean
}

/**
 * Подключает обновление по тяге вниз к экрану, пока тот смонтирован.
 * Сам жест, спиннер и сдвиг страницы живут в `PageOverscroll` — здесь только
 * объявление «этот экран умеет обновляться».
 */
export const PullToRefresh = ({ children, onRefresh, disabled = false }: PullToRefreshProps) => {
  const register = useContext(PullToRefreshContext)

  useEffect(() => register({ onRefresh, disabled }), [register, onRefresh, disabled])

  return children
}
