import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { getAppScrollRoot } from '@/shared/ui/appScroll'
import { isBodyScrollLocked } from '@/shared/lib/hooks/useBodyScrollLock'

/** Предел смещения: к нему кривая сопротивления стремится, но не достигает. */
export const MAX_OVERSCROLL_DISTANCE = 140
/** Мёртвая зона: до неё жест не считается тягой (тап, дрожание пальца, выбор оси). */
const ACTIVATION_SLOP = 8
/** Допуск на дробный scrollTop у нижнего края. */
const EDGE_EPSILON = 1
/** Пружина возврата: критическое затухание — возвращается без колебаний. */
const SETTLE_SPRING = { type: 'spring', stiffness: 300, damping: 35 } as const
/** Бросок медленнее этого (px/с) в край не отскакивает. */
const FLING_MIN_VELOCITY = 300
/** Потолок скорости броска (px/с): ограничивает вылет за край (~50px). */
const FLING_MAX_VELOCITY = 2500
/** Замер скорости старше этого (мс) — уже не бросок, а остановка или прыжок скролла. */
const FLING_SAMPLE_MAX_AGE_MS = 80

type Edge = 'top' | 'bottom'
/** Куда сдвинуто содержимое: 1 — вниз (верхний край), -1 — вверх (нижний), 0 — на месте. */
export type OverscrollDirection = -1 | 0 | 1

interface DragGesture {
  anchorX: number
  anchorY: number
  /** Край, от которого тянут; null — жест ещё не распознан как тяга. */
  edge: Edge | null
}

interface UseOverscrollBounceOptions {
  /** Тяга и отскок выключены (например, пока содержимое удерживается обновлением). */
  disabled?: boolean
  /** Смещение покоя: туда пружина возвращает содержимое, когда палец отпущен. */
  restOffset?: number
  /** Палец отпущен после тяги; `offset` — смещение в момент отпускания. */
  onRelease?: (offset: number) => void
}

interface OverscrollBounce<T extends HTMLElement> {
  /** Область, касания внутри которой могут тянуть содержимое за край. */
  containerRef: RefObject<T | null>
  /** Смещение содержимого по Y: >0 — оттянуто вниз, <0 — вверх. */
  offset: MotionValue<number>
  direction: OverscrollDirection
}

/**
 * «Резинка»: у начала содержимое идёт за пальцем 1:1, дальше плавно замедляется
 * и асимптотически упирается в MAX_OVERSCROLL_DISTANCE — без жёсткой остановки.
 */
const applyResistance = (distance: number): number =>
  (distance * MAX_OVERSCROLL_DISTANCE) / (MAX_OVERSCROLL_DISTANCE + distance)

const getEdges = (root: HTMLElement) => ({
  atTop: root.scrollTop <= 0,
  atBottom: root.scrollTop >= root.scrollHeight - root.clientHeight - EDGE_EPSILON,
})

/** Край, за который уводит вертикальное движение пальца; null — это обычный скролл. */
const resolvePulledEdge = (root: HTMLElement, deltaY: number): Edge | null => {
  const { atTop, atBottom } = getEdges(root)
  if (deltaY > 0 && atTop) return 'top'
  if (deltaY < 0 && atBottom) return 'bottom'
  return null
}

/**
 * Резинка на краях единого scroll-root приложения, как в нативных списках:
 * содержимое тянется за пальцем за край и пружинит обратно, а бросок в край
 * отскакивает. Нативный overscroll у scroll-root выключен (он сдвигал бы всю
 * страницу вместе с шапкой), поэтому эффект воспроизводится здесь — сдвигом
 * только самого содержимого.
 *
 * Хук отдаёт `offset` (motion value) — потребитель вешает его на `y` содержимого.
 */
export const useOverscrollBounce = <T extends HTMLElement = HTMLDivElement>({
  disabled = false,
  restOffset = 0,
  onRelease,
}: UseOverscrollBounceOptions = {}): OverscrollBounce<T> => {
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<T>(null)
  // Смещение — motion value: меняется на каждом touchmove мимо рендера React.
  const offset = useMotionValue(0)
  const [direction, setDirection] = useState<OverscrollDirection>(0)
  const stopAnimationRef = useRef<(() => void) | null>(null)

  useMotionValueEvent(offset, 'change', value => {
    setDirection(value > 0 ? 1 : value < 0 ? -1 : 0)
  })

  const settle = useCallback(
    (target: number) => {
      stopAnimationRef.current?.()
      const controls = animate(offset, target, reduceMotion ? { duration: 0 } : SETTLE_SPRING)
      stopAnimationRef.current = () => controls.stop()
    },
    [offset, reduceMotion]
  )

  // Смещение покоя сменилось (обновление началось или закончилось) — едем к новому.
  useEffect(() => {
    settle(restOffset)
  }, [restOffset, settle])

  const canStart = useEffectEvent(() => !disabled && !isBodyScrollLocked())
  const release = useEffectEvent(() => {
    onRelease?.(offset.get())
    settle(restOffset)
  })

  useEffect(() => {
    const container = containerRef.current
    const root = getAppScrollRoot()
    if (!container || !root) return

    let gesture: DragGesture | null = null
    let isTouching = false
    let lastScrollTop = root.scrollTop
    let lastScrollTime = 0
    /** Скорость скролла, px/с; знак как у scrollTop (>0 — к нижнему краю). */
    let scrollVelocity = 0

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      gesture =
        touch && event.touches.length === 1 && canStart()
          ? { anchorX: touch.clientX, anchorY: touch.clientY, edge: null }
          : null
    }

    // Non-passive: только так `preventDefault` гасит нативный скролл под тягой.
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!gesture || !touch) return

      if (gesture.edge === null) {
        const deltaX = touch.clientX - gesture.anchorX
        const deltaY = touch.clientY - gesture.anchorY
        const edge = resolvePulledEdge(root, deltaY)

        // Пока движение не уводит за край — это обычный скролл. Якорь едет за
        // пальцем, чтобы тяга подхватилась тем же касанием, как только скролл
        // дойдёт до края, без повторного касания.
        if (!edge) {
          gesture.anchorX = touch.clientX
          gesture.anchorY = touch.clientY
          return
        }

        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < ACTIVATION_SLOP) return

        // Горизонтальный жест (лента чипов фильтров) — не наш.
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          gesture = null
          return
        }

        gesture.edge = edge
        // Отсчёт от границы мёртвой зоны: содержимое трогается с нуля, без скачка.
        gesture.anchorY += edge === 'top' ? ACTIVATION_SLOP : -ACTIVATION_SLOP
        stopAnimationRef.current?.()
      }

      const sign = gesture.edge === 'top' ? 1 : -1
      const distance = (touch.clientY - gesture.anchorY) * sign
      if (distance <= 0) {
        offset.set(0)
        return
      }

      if (event.cancelable) event.preventDefault()
      offset.set(sign * applyResistance(distance))
    }

    const handleTouchEnd = () => {
      const wasPulling = gesture?.edge != null
      gesture = null
      if (wasPulling) release()
    }

    const handleRootTouch = (event: TouchEvent) => {
      isTouching = event.touches.length > 0
    }

    // Бросок в край: браузер останавливает скролл у границы, и мы продолжаем
    // движение пружиной с той же скоростью — содержимое вылетает за край и
    // возвращается. Скорость берём из замеров до удара: сам удар уже обрезан.
    const handleScroll = (event: Event) => {
      const elapsed = event.timeStamp - lastScrollTime
      const isFresh = elapsed > 0 && elapsed <= FLING_SAMPLE_MAX_AGE_MS
      const { atTop, atBottom } = getEdges(root)
      const hitEdge = (atTop && scrollVelocity < 0) || (atBottom && scrollVelocity > 0)

      if (
        hitEdge &&
        isFresh &&
        Math.abs(scrollVelocity) >= FLING_MIN_VELOCITY &&
        !isTouching &&
        !reduceMotion &&
        offset.get() === 0 &&
        canStart()
      ) {
        const speed = Math.min(Math.abs(scrollVelocity), FLING_MAX_VELOCITY)
        stopAnimationRef.current?.()
        // Пружина из нуля в ноль с начальной скоростью: вылет и возврат.
        const controls = animate(offset, 0, {
          ...SETTLE_SPRING,
          velocity: -Math.sign(scrollVelocity) * speed,
        })
        stopAnimationRef.current = () => controls.stop()
      }

      scrollVelocity =
        isFresh && !atTop && !atBottom ? ((root.scrollTop - lastScrollTop) / elapsed) * 1000 : 0
      lastScrollTop = root.scrollTop
      lastScrollTime = event.timeStamp
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    container.addEventListener('touchcancel', handleTouchEnd)
    root.addEventListener('touchstart', handleRootTouch, { passive: true })
    root.addEventListener('touchend', handleRootTouch)
    root.addEventListener('touchcancel', handleRootTouch)
    root.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('touchcancel', handleTouchEnd)
      root.removeEventListener('touchstart', handleRootTouch)
      root.removeEventListener('touchend', handleRootTouch)
      root.removeEventListener('touchcancel', handleRootTouch)
      root.removeEventListener('scroll', handleScroll)
      stopAnimationRef.current?.()
    }
  }, [offset, reduceMotion])

  return { containerRef, offset, direction }
}
