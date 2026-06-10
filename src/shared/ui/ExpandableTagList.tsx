import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const DEFAULT_COLLAPSED_LIMIT = 9

interface ExpandableTagListProps<T> {
  items: T[]
  getKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  collapsedLimit?: number
  /** Элементы, которые остаются видимыми в свёрнутом состоянии (например, выбранные). */
  priorityKeys?: string[]
  className?: string
}

export const ExpandableTagList = <T,>({
  items,
  getKey,
  renderItem,
  collapsedLimit = DEFAULT_COLLAPSED_LIMIT,
  priorityKeys = [],
  className,
}: ExpandableTagListProps<T>) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const canCollapse = items.length > collapsedLimit

  const visibleItems = useMemo(() => {
    if (!canCollapse || expanded) return items

    const visible = items.slice(0, collapsedLimit)
    const visibleKeys = new Set(visible.map(getKey))

    for (const key of priorityKeys) {
      if (visibleKeys.has(key)) continue
      const item = items.find(entry => getKey(entry) === key)
      if (!item) continue
      visible.push(item)
      visibleKeys.add(key)
    }

    return visible
  }, [items, getKey, collapsedLimit, expanded, canCollapse, priorityKeys])

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex flex-wrap gap-2">
        {visibleItems.map(item => (
          <span key={getKey(item)} className="contents">
            {renderItem(item)}
          </span>
        ))}
      </div>

      {canCollapse ? (
        <button
          type="button"
          onClick={() => setExpanded(value => !value)}
          data-haptic="light"
          className="mt-1 inline-flex w-fit items-center gap-1 py-0.5 text-sm font-semibold text-primary transition-opacity hover:opacity-80 active:opacity-70"
          aria-expanded={expanded}
        >
          {expanded
            ? t('feed.showLessSpecializations')
            : t('feed.showAllSpecializations', { count: items.length })}
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-180')}
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  )
}
