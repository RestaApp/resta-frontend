import { useCallback, useMemo, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
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
  const tabRefs = useRef(new Map<T, HTMLButtonElement>())
  const reduceMotion = useReducedMotion()

  const ids = useMemo(() => options.map(o => o.id), [options])

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
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn('relative flex rounded-xl border border-border p-1', className)}
    >
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
            ref={el => {
              if (el) tabRefs.current.set(option.id, el)
              else tabRefs.current.delete(option.id)
            }}
            className={cn(
              'relative flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-300',
              'outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive ? 'font-semibold text-white' : 'text-muted-foreground hover:bg-muted/60'
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="tabs-active-indicator"
                className="absolute inset-0 rounded-lg gradient-primary shadow-sm"
                transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeInOut' }}
                aria-hidden="true"
              />
            ) : null}

            <span className="relative z-10 flex items-center justify-center gap-2">
              {Icon ? (
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              ) : null}
              <span className={isActive ? 'font-semibold' : 'font-medium'}>{option.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
