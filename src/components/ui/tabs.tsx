import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'

export type TabOption<T extends string> = {
  id: T
  label: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
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

    const c = container.getBoundingClientRect()
    const r = el.getBoundingClientRect()

    setIndicator({ left: r.left - c.left, width: r.width })
  }, [activeId])

  useLayoutEffect(() => {
    updateIndicator()
    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(updateIndicator)
    ro.observe(container)

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
      className={cn('relative flex gap-2 rounded-xl border border-border p-1', className)}
    >
      <motion.div
        aria-hidden="true"
        className={cn('absolute bottom-1 top-1 rounded-lg gradient-primary')}
        initial={false}
        animate={{ left: indicator.left, width: indicator.width }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      {options.map(option => {
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
            className={cn(
              'relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2',
              'outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive ? 'text-white' : 'text-foreground'
            )}
          >
            {Icon ? <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" /> : null}
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}