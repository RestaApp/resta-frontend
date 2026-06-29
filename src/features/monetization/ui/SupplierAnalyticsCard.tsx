import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, Globe, Lock, Mail, Phone, Send, TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { KpiRow, type KpiItem } from '@/components/ui/kpi-row'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_LOGO_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'
import { ICON_MD_CLASS } from '@/shared/constants/role-icons'
import { MONETIZATION_ENABLED } from '@/shared/config/monetization'
import { HelpHint } from '@/components/ui/help-hint'
import { useGetSupplierAnalyticsQuery, type ContactType } from '@/services/api/analyticsApi'
import { UpgradeProDrawer } from './UpgradeProDrawer'

const CONTACT_ICONS: Record<ContactType, typeof Phone> = {
  phone: Phone,
  telegram: Send,
  email: Mail,
  website: Globe,
}

const CONTACT_ORDER: ContactType[] = ['phone', 'telegram', 'email', 'website']

/** Стрелка роста/падения относительно прошлого месяца. */
const DeltaBadge = memo(function DeltaBadge({
  current,
  previous,
}: {
  current: number
  previous: number
}) {
  const delta = current - previous
  if (delta === 0) return null
  const isUp = delta > 0
  const Icon = isUp ? TrendingUp : TrendingDown
  return (
    <span
      className={cn(
        'ml-1 inline-flex items-center gap-0.5 text-xs font-medium align-middle',
        isUp ? 'text-success' : 'text-destructive'
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {Math.abs(delta)}
    </span>
  )
})

interface SupplierAnalyticsCardProps {
  /** Запрос идёт только для поставщика. */
  isSupplier: boolean
}

/**
 * Дашборд аналитики поставщика (GET /analytics/supplier).
 *  • показывает просмотры/уникальных/CTR/запросы прайса за текущий месяц со сравнением с прошлым;
 *  • разбивку кликов по контактам;
 *  • при `analytics_locked` (FREE-план) и включённой монетизации — локап с CTA на PRO.
 */
export const SupplierAnalyticsCard = memo(function SupplierAnalyticsCard({
  isSupplier,
}: SupplierAnalyticsCardProps) {
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data, isLoading, isError } = useGetSupplierAnalyticsQuery(undefined, {
    skip: !isSupplier,
  })

  if (!isSupplier || isLoading || isError || !data) return null

  const {
    current_month: current,
    previous_month: previous,
    total_views: allTimeViews,
    analytics_locked,
  } = data.data

  // FREE-план отдаёт только total_views без помесячной разбивки (analytics_locked: true).
  // Без current/previous дашборд не построить — показываем локап (при включённой
  // монетизации) либо ничего (монетизация в спящем режиме).
  if (analytics_locked || !current || !previous) {
    if (!MONETIZATION_ENABLED) return null
    return (
      <>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          data-haptic="light"
          className={cn(SHIFT_CARD_CLASS, 'flex w-full items-center gap-3 text-left')}
        >
          <span className={cn(SHIFT_CARD_LOGO_CLASS, 'bg-primary/15 text-primary')}>
            <Lock className="h-5 w-5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
              {t('profile.analytics.lockedTitle')}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {t('profile.analytics.lockedSubtitle')}
            </span>
          </div>
        </button>
        <UpgradeProDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      </>
    )
  }

  const kpis: KpiItem[] = [
    {
      id: 'views',
      value: (
        <span className="inline-flex items-baseline">
          {current.views}
          <DeltaBadge current={current.views} previous={previous.views} />
        </span>
      ),
      label: t('profile.analytics.views'),
      tone: 'primary',
    },
    {
      id: 'unique',
      value: current.unique_viewers,
      label: t('profile.analytics.uniqueViewers'),
    },
    {
      id: 'ctr',
      value: `${current.ctr.toFixed(1)}%`,
      label: t('profile.analytics.ctr'),
      tone: current.ctr > 0 ? 'success' : 'muted',
    },
  ]

  const contactRows = CONTACT_ORDER.map(type => ({
    type,
    count: current.contact_clicks[type] ?? 0,
  })).filter(row => row.count > 0)

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className={PROFILE_SECTION_LABEL_CLASS}>{t('profile.analytics.title')}</span>
        <HelpHint topic="analytics" />
      </div>

      <KpiRow
        items={kpis}
        className="gap-2"
        itemClassName="rounded-lg border-border bg-card px-2 py-3"
      />

      <Card className={cn(SHIFT_CARD_CLASS, 'flex flex-col gap-3')}>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className={ICON_MD_CLASS} aria-hidden="true" />
            {t('profile.analytics.priceListRequests')}
          </span>
          <span className="font-semibold">{current.price_list_requests}</span>
        </div>

        {contactRows.length > 0 ? (
          <div className="flex flex-col gap-2 border-t border-border/50 pt-3">
            <span className="text-xs text-muted-foreground">
              {t('profile.analytics.contactClicks')}
            </span>
            <div className="flex flex-wrap gap-3">
              {contactRows.map(({ type, count }) => {
                const Icon = CONTACT_ICONS[type]
                return (
                  <span key={type} className="flex items-center gap-1 text-sm">
                    <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    {count}
                  </span>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
          <span>{t('profile.analytics.allTimeViews')}</span>
          <span className="font-semibold text-foreground">{allTimeViews}</span>
        </div>
      </Card>
    </section>
  )
})
