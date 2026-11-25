import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { getAppScrollRoot } from '@/shared/ui/appScroll'
import { isBodyScrollLocked } from '@/shared/lib/hooks/useBodyScrollLock'

// ── Параметры ощущения. Подбираются на реальном устройстве. ──────────────────
/** Предел смещения под пальцем: к нему кривая сопротивления стремится, но не достигает. */
const MAX_DRAG_DISTANCE = 140
/** Мёртвая зона: до неё жест не считается тягой (тап, дрожание пальца, выбор оси). */
const ACTIVATION_SLOP = 8
/**
 * Пружина возврата и отскока. Критическое затухание (damping ≈ 2·√stiffness) —
 * без колебаний; чем меньше stiffness, тем мягче и дольше дуга.
 */
const SPRING = { type: 'spring', stiffness: 170, damping: 26 } as const
/** Бросок медленнее этого (px/с) в край не отскакивает. */
const FLING_MIN_VELOCITY = 300
/** Потолок скорости броска (px/с): ограничивает вылет за край (~110px). */
const FLING_MAX_VELOCITY = 4000
/**
 * Отскок стартует, когда до края осталось меньше этого времени полёта (с).
 * Событие скролла приходит на кадр-два позже самой прокрутки: если ждать удара
 * в край, содержимое успевает замереть, прежде чем пружина тронется.
 */
const FLING_LOOKAHEAD_S = 0.035
/** Замер скорости старше этого (мс) — уже не бросок, а остановка или прыжок скролла. */
const FLING_SAMPLE_MAX_AGE_MS = 80
/** Допуск на дробный scrollTop у нижнего края. */
const EDGE_EPSILON = 1

type Edge = 'top' | 'bottom'

interface DragGesture {
  anchorX: number
  anchorY: number
  /** Край, от которого тянут; null — жест ещё не распознан как тяга. */
  edge: Edge | null
}

interface UseOverscrollBounceOptions {
  /** Имитация выключена: слушатели не вешаются (нативная резинка, идёт обновление). */
  disabled?: boolean
  /** Смещение покоя: туда пружина возвращает содержимое, когда его ничто не тянет. */
  restOffset?: number
}

interface OverscrollBounce<T extends HTMLElement> {
  /** Область, касания внутри которой могут тянуть содержимое за край. */
  containerRef: RefObject<T | null>
  /** Смещение содержимого по Y: >0 — оттянуто вниз, <0 — вверх. */
  offset: MotionValue<number>
  /** Содержимое сейчас сдвинуто (жест, отскок или удержание на `restOffset`). */
  isShifted: boolean
}

/**
 * «Резинка»: у начала содержимое идёт за пальцем 1:1, дальше плавно замедляется
 * и асимптотически упирается в MAX_DRAG_DISTANCE — без жёсткой остановки.
 */
const applyResistance = (distance: number): number =>
  (distance * MAX_DRAG_DISTANCE) / (MAX_DRAG_DISTANCE + distance)

/** Сколько осталось прокрутить до каждого края. */
const getEdgeDistances = (root: HTMLElement) => ({
  toTop: root.scrollTop,
  toBottom: root.scrollHeight - root.clientHeight - root.scrollTop,
})

/** Край, за который уводит вертикальное движение пальца; null — это обычный скролл. */
const resolvePulledEdge = (root: HTMLElement, deltaY: number): Edge | null => {
  const { toTop, toBottom } = getEdgeDistances(root)
  if (deltaY > 0 && toTop <= 0) return 'top'
  if (deltaY < 0 && toBottom <= EDGE_EPSILON) return 'bottom'
  return null
}

/**
 * Имитация резинки на краях единого scroll-root — для платформ без нативной
 * (на iOS её даёт система, см. `PageOverscroll`). Содержимое тянется за пальцем
 * за край и пружинит обратно, а бросок в край отскакивает.
 *
 * Хук отдаёт `offset` (motion value) — потребитель вешает его на `y` содержимого.
 * Удержание на `restOffset` работает и при `disabled`.
 */
export const useOverscrollBounce = <T extends HTMLElement = HTMLDivElement>({
  disabled = false,
  restOffset = 0,
}: UseOverscrollBounceOptions = {}): OverscrollBounce<T> => {
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<T>(null)
  // Смещение — motion value: меняется на каждом touchmove мимо рендера React.
  const offset = useMotionValue(0)
  const [isShifted, setIsShifted] = useState(false)
  const stopAnimationRef = useRef<(() => void) | null>(null)

  useMotionValueEvent(offset, 'change', value => setIsShifted(value !== 0))

  const settle = useCallback(
    (target: number) => {
      stopAnimationRef.current?.()
      const controls = animate(offset, target, reduceMotion ? { duration: 0 } : SPRING)
      stopAnimationRef.current = () => controls.stop()
    },
    [offset, reduceMotion]
  )

  // Смещение покоя сменилось (обновление началось или закончилось) — едем к новому.
  useEffect(() => {
    settle(restOffset)
  }, [restOffset, settle])

  useEffect(() => () => stopAnimationRef.current?.(), [])

  useEffect(() => {
    const container = containerRef.current
    const root = getAppScrollRoot()
    if (disabled || !container || !root) return

    let gesture: DragGesture | null = null
    let isTouching = false
    let isBouncing = false
    let lastScrollTop = root.scrollTop
    let lastScrollTime = 0

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      gesture =
        touch && event.touches.length === 1 && !isBodyScrollLocked()
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
        isBouncing = false
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
      if (wasPulling) settle(restOffset)
    }

    const handleRootTouch = (event: TouchEvent) => {
      isTouching = event.touches.length > 0
    }

    // Бросок в край: браузер останавливает скролл у границы, и мы продолжаем
    // движение пружиной с той же скоростью — содержимое вылетает за край и
    // возвращается.
    const handleScroll = (event: Event) => {
      const elapsed = event.timeStamp - lastScrollTime
      // Старый замер — не бросок: скролл стоял либо это программный прыжок.
      const velocity =
        elapsed > 0 && elapsed <= FLING_SAMPLE_MAX_AGE_MS
          ? ((root.scrollTop - lastScrollTop) / elapsed) * 1000
          : 0
      lastScrollTop = root.scrollTop
      lastScrollTime = event.timeStamp

      const speed = Math.abs(velocity)
      if (speed < FLING_MIN_VELOCITY || isTouching || isBouncing || reduceMotion) return
      if (offset.get() !== restOffset || isBodyScrollLocked()) return

      const { toTop, toBottom } = getEdgeDistances(root)
      const distanceToEdge = velocity < 0 ? toTop : toBottom
      if (distanceToEdge > speed * FLING_LOOKAHEAD_S) return

      isBouncing = true
      stopAnimationRef.current?.()
      // Пружина из покоя в покой с начальной скоростью: вылет и возврат.
      const controls = animate(offset, restOffset, {
        ...SPRING,
        velocity: -Math.sign(velocity) * Math.min(speed, FLING_MAX_VELOCITY),
        onComplete: () => {
          isBouncing = false
        },
      })
      stopAnimationRef.current = () => controls.stop()
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
    }
  }, [disabled, offset, reduceMotion, restOffset, settle])

  return { containerRef, offset, isShifted }
}
