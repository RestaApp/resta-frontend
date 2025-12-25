/**
 * Переиспользуемые табы
 */

import type { JSX } from 'react'

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
}: TabsProps<T>): JSX.Element => {
  return (
    <div
      role="tablist"
      className={`flex gap-2 p-1 rounded-xl border ${className ?? ''}`}
      style={{ borderColor: 'var(--border)' }}
    >
      {options.map(option => {
        const isActive = option.id === activeId
        const Icon = option.icon
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className="flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
            style={{
              background: isActive ? 'var(--gradient-primary)' : 'transparent',
              color: isActive ? 'white' : 'inherit',
            }}
          >
            {Icon ? <Icon className="w-4 h-4" /> : null}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}


