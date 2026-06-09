import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'
import type { ActiveFilterItem } from '@/shared/types/active-filters'

interface FilterChipProps extends ActiveFilterItem {
  onRemove?: () => void
}

export const FilterChip = memo(function FilterChip({
  label,
  icon: Icon,
  variant = 'default',
  onRemove,
}: FilterChipProps) {
  const { t } = useTranslation()
  const isPrimary = variant === 'primary'

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background py-1 pl-2.5 pr-1 text-xs font-medium',
        isPrimary ? 'text-primary' : 'text-foreground'
      )}
    >
      {Icon ? <Icon className={ICON_SM_CLASS} aria-hidden /> : null}
      <span className="whitespace-nowrap">{label}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('feed.removeFilterAria', { label })}
          className={cn(
            'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors',
            isPrimary ? 'hover:bg-primary/10' : 'hover:bg-muted/60'
          )}
        >
          <X className="h-3 w-3 shrink-0" aria-hidden />
        </button>
      ) : null}
    </span>
  )
})
