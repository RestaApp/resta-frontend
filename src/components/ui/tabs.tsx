import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'

export type TabOption<T extends string> = {
  id: T
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface TabsProps<T extends string> {
  options: TabOption<T>[]
  activeId: T
  onChange: (id: T) => void
  className?: string
  ariaLabel?: string
}

export const Tabs = <T extends string>({
  options,
  activeId,
  onChange,
  className,
  ariaLabel = 'Tabs',
}: TabsProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef(new Map<T, HTMLButtonElement>())
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const ids = useMemo(() => options.map(o => o.id), [options])

  const updateIndicator = useCallback(() => {
    const el = tabRefs.current.get(activeId)
    const container = containerRef.current
    if (!el || !container) return

    // left относительно контейнера
    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()

    setIndicator({
      left: elRect.left - containerRect.left,
      width: elRect.width,
    })
  }, [activeId])

  useLayoutEffect(() => {
    updateIndicator()

    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(() => updateIndicator())
    ro.observe(container)

    // наблюдаем и активный таб тоже (на случай динамического текста/иконок)
    const activeEl = tabRefs.current.get(activeId)
    if (activeEl) ro.observe(activeEl)

    return () => ro.disconnect()
  }, [activeId, updateIndicator])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIdx = ids.indexOf(activeId)
      if (currentIdx === -1) return

      const move = (nextIdx: number) => {
        const nextId = ids[nextIdx]
        onChange(nextId)
        tabRefs.current.get(nextId)?.focus()
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          move((currentIdx + 1) % ids.length)
          break
        case 'ArrowLeft':
          e.preventDefault()
          move((currentIdx - 1 + ids.length) % ids.length)
          break
        case 'Home':
          e.preventDefault()
          move(0)
          break
        case 'End':
          e.preventDefault()
          move(ids.length - 1)
          break
      }
    },
    [activeId, ids, onChange]
  )

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={`relative flex gap-2 p-1 rounded-xl border ${className ?? ''}`}
      style={{ borderColor: 'var(--border)' }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute top-1 bottom-1 rounded-lg"
        style={{ background: 'var(--gradient-primary)' }}
        initial={false}
        animate={{ left: indicator.left, width: indicator.width }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      {options.map((option) => {
        const isActive = option.id === activeId
        const Icon = option.icon

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            id={`tab-${option.id}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(option.id)}
            ref={(el) => {
              if (el) tabRefs.current.set(option.id, el)
              else tabRefs.current.delete(option.id)
            }}
            className="relative z-10 flex-1 py-2 rounded-lg flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ color: isActive ? 'white' : 'inherit' }}
          >
            {Icon ? (
              <motion.span
                aria-hidden="true"
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="w-4 h-4" />
              </motion.span>
            ) : null}
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
