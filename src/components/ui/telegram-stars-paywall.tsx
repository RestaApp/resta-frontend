import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Card } from './card'
import { META_MONO_CLASS, MODAL_TITLE_CLASS, PRICE_EMPHASIS_CLASS } from './ui-patterns'
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
        <Badge variant="stars" className="px-3 py-1.5 text-xs">
          <Star className="h-3 w-3 fill-current" /> TELEGRAM STARS
        </Badge>
      </div>

      <h2 className={cn('text-center', MODAL_TITLE_CLASS)}>
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
                    META_MONO_CLASS,
                    plan.highlighted ? 'text-warning' : 'text-muted-foreground'
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
                    PRICE_EMPHASIS_CLASS,
                    'inline-flex items-center gap-1',
                    plan.highlighted ? 'text-warning' : 'text-foreground'
                  )}
                >
                  <Star className="h-4 w-4 fill-current" />
                  {plan.stars.toLocaleString('ru-RU')}
                </div>
                {plan.fiatHint ? (
                  <div className={cn(META_MONO_CLASS, 'normal-case mt-0.5')}>{plan.fiatHint}</div>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>

      <div className={cn(META_MONO_CLASS, 'mt-1')}>Всё включено</div>
      <Card padding="sm" className="flex flex-col gap-1">
        <ul className="flex flex-col gap-1">
          {features.map(f => (
            <li key={f.id} className="flex items-center gap-2 text-xs">
              <span className="text-primary font-bold">✓</span>
              <span>{f.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Button
        size="lg"
        variant="stars"
        onClick={() => onPay(selectedPlan)}
        loading={isPaying}
        className="mt-2 w-full"
      >
        <Star className="h-4 w-4 fill-current" /> Оплатить{' '}
        {selectedPlan.stars.toLocaleString('ru-RU')} Stars
      </Button>
    </div>
  )
}
