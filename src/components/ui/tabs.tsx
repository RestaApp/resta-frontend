/**
 * Переиспользуемые табы с плавным свайпом
 */

import { useRef, useEffect, useState } from 'react'
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
}

export const Tabs = <T extends string>({
  options,
  activeId,
  onChange,
  className,
}: TabsProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<T, HTMLButtonElement>>(new Map())
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const activeTab = tabRefs.current.get(activeId)
    const container = containerRef.current

    if (activeTab && container) {
      const containerRect = container.getBoundingClientRect()
      const tabRect = activeTab.getBoundingClientRect()

      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      })
    }
  }, [activeId, options])

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={`relative flex gap-2 p-1 rounded-xl border ${className ?? ''}`}
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Анимированный индикатор */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-lg"
        style={{
          background: 'var(--gradient-primary)',
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        initial={false}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />

      {options.map(option => {
        const isActive = option.id === activeId
        const Icon = option.icon
        return (
          <button
            key={option.id}
            ref={(el) => {
              if (el) {
                tabRefs.current.set(option.id, el)
              } else {
                tabRefs.current.delete(option.id)
              }
            }}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className="relative z-10 flex-1 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
            style={{
              color: isActive ? 'white' : 'inherit',
            }}
          >
            {Icon ? (
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{
                  duration: 0.3,
                }}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
            ) : null}
            <span className="transition-all duration-300">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}



