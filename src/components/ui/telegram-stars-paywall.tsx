import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Badge } from './badge'
import { Button } from './button'

export interface StarsPlan {
  id: string
  /** Заголовок периода: «Месяц» / «Год». */
  period: string
  /** Подзаголовок: «Рекомендуем» / «Экономия 20%». */
  hint?: string
  /** Цена в Stars. */
  stars: number
  /** Эквивалент в фиате (для отображения, формат свободный — например «≈ 49 BYN»). */
  fiatHint?: string
  /** Подсветить как рекомендуемый (карточка с акцентом). */
  highlighted?: boolean
}

export interface StarsFeature {
  id: string
  text: string
}

interface TelegramStarsPaywallProps {
  /** Заголовок — «Restaurant PRO» / «Supplier PRO». */
  title: string
  /** Тонкий tagline. */
  subtitle?: string
  plans: StarsPlan[]
  features: StarsFeature[]
  /** ID выбранного плана. */
  selectedPlanId: string
  onSelectPlan: (planId: string) => void
  /**
   * Хук оплаты. Должен открывать Telegram Stars invoice
   * (см. ниже HANDOFF — нужен endpoint `POST /billing/stars/invoice`).
   */
  onPay: (plan: StarsPlan) => void
  isPaying?: boolean
  className?: string
}

/**
 * Paywall для Telegram Stars (см. R* в Resta Wireframes).
 *
 * SRP: только презентация тарифов и CTA.
 * Любая бизнес-логика (создание invoice, обработка успеха) — в проп `onPay`.
 *
 * Backend требуется (см. HANDOFF.md):
 *  • POST /billing/stars/invoice — создаёт Telegram Stars invoice по plan_id;
 *  • POST /billing/stars/webhook — приём Telegram payment_succeeded;
 *  • GET  /billing/subscription — текущая подписка пользователя.
 */
export const TelegramStarsPaywall = ({
  title,
  subtitle,
  plans,
  features,
  selectedPlanId,
  onSelectPlan,
  onPay,
  isPaying,
  className,
}: TelegramStarsPaywallProps) => {
  const selectedPlan = plans.find(p => p.id === selectedPlanId) ?? plans[0]

  if (!selectedPlan) return null

  return (
    <div
      className={cn('relative flex flex-col gap-3', className)}
      style={{ backgroundImage: 'var(--gradient-stars-glow)' }}
    >
      <div className="text-center">
        <Badge variant="stars" className="px-3 py-1.5 text-meta">
          <Star className="h-3 w-3 fill-current" /> TELEGRAM STARS
        </Badge>
      </div>

      <h2 className="text-center text-2xl font-extrabold tracking-tight leading-tight">
        {title.split(' PRO')[0]} <span style={{ color: 'var(--stars)' }}>PRO</span>
      </h2>
      {subtitle ? (
        <p className="text-center text-sm text-muted-foreground -mt-1">{subtitle}</p>
      ) : null}

      <div className="flex flex-col gap-2">
        {plans.map(plan => {
          const active = plan.id === selectedPlan.id
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelectPlan(plan.id)}
              className={cn(
                'flex w-full items-start justify-between gap-3 rounded-lg border p-4 text-left transition-colors',
                active
                  ? 'border-[rgba(179,140,255,0.4)] bg-[linear-gradient(160deg,rgba(179,140,255,0.10),var(--card)_70%)]'
                  : 'border-border bg-card'
              )}
            >
              <div>
                <div
                  className={cn(
                    'text-micro font-mono-resta uppercase tracking-wider',
                    plan.highlighted ? 'text-amber' : 'text-muted-foreground'
                  )}
                >
                  {plan.period}
                  {plan.hint ? ` · ${plan.hint}` : null}
                </div>
                <div className="mt-1 text-sm font-semibold">
                  {plan.period === 'Месяц' ? 'PRO Monthly' : 'PRO Yearly'}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    'text-xl font-extrabold tracking-tight inline-flex items-center gap-1',
                    plan.highlighted ? 'text-amber' : 'text-foreground'
                  )}
                >
                  <Star className="h-4 w-4 fill-current" />
                  {plan.stars.toLocaleString('ru-RU')}
                </div>
                {plan.fiatHint ? (
                  <div className="text-micro font-mono-resta text-muted-foreground mt-0.5">
                    {plan.fiatHint}
                  </div>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>

      <div className="text-micro font-mono-resta uppercase tracking-wider text-muted-foreground mt-1">
        Всё включено
      </div>
      <ul className="rounded-lg border border-border bg-card p-3 flex flex-col gap-1">
        {features.map(f => (
          <li key={f.id} className="flex items-center gap-2 text-xs">
            <span className="text-terracotta font-bold">✓</span>
            <span>{f.text}</span>
          </li>
        ))}
      </ul>

      <Button
        size="lg"
        onClick={() => onPay(selectedPlan)}
        loading={isPaying}
        className="mt-2 w-full"
        style={{
          background: 'var(--gradient-stars)',
          boxShadow: 'var(--shadow-stars-cta)',
        }}
      >
        <Star className="h-4 w-4 fill-current" /> Оплатить{' '}
        {selectedPlan.stars.toLocaleString('ru-RU')} Stars
      </Button>
    </div>
  )
}
