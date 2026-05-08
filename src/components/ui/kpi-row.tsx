import { cn } from '@/utils/cn'

export interface KpiItem {
  /** Уникальный id (используется как ключ списка). */
  id: string
  /** Большое число (12 / 4.9 / 1 580). */
  value: React.ReactNode
  /** Подпись маленьким моноширинным шрифтом. */
  label: string
  /** Опц. цвет значения (success / warning / danger / accent). */
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'muted'
}

interface KpiRowProps {
  items: KpiItem[]
  className?: string
}

const TONE_CLASS: Record<NonNullable<KpiItem['tone']>, string> = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
  accent: 'text-terracotta',
  muted: 'text-muted-foreground',
}

/**
 * KPI-строка из спецификации (см. E08, E10, R01, R02, S03 в Resta Wireframes).
 * Универсальная сетка из равных карточек: значение крупно, подпись мелким моно.
 *
 * SRP: единственная задача — показать KPI. Любая логика расчёта — снаружи.
 */
export const KpiRow = ({ items, className }: KpiRowProps) => (
  <div
    className={cn('grid gap-1.5', className)}
    style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
  >
    {items.map(({ id, value, label, tone = 'default' }) => (
      <div key={id} className="rounded-xl bg-card px-2 py-2.5 text-center border border-border/40">
        <div className={cn('text-lg font-bold tracking-tight leading-none', TONE_CLASS[tone])}>
          {value}
        </div>
        <div className="mt-1 text-micro uppercase tracking-wider font-mono-resta text-muted-foreground">
          {label}
        </div>
      </div>
    ))}
  </div>
)
