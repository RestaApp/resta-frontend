import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/utils/cn'
import { formatMoney } from '@/shared/shifts/formatting'
import {
  SHIFT_CARD_CURRENCY_CLASS,
  SHIFT_CARD_PRICE_CLASS,
  SHIFT_CARD_SUB_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'

interface ShiftCardPriceBlockProps {
  amount?: number | null
  currency?: string
  className?: string
}

export const ShiftCardPriceBlock = ({
  amount,
  currency = 'BYN',
  className,
}: ShiftCardPriceBlockProps) => {
  const { t } = useTranslation()

  const payNumber = amount == null ? null : Number(amount)
  const hasPay = payNumber != null && Number.isFinite(payNumber) && payNumber > 0

  return (
    <div className={cn('shrink-0 text-right leading-none tabular-nums text-foreground', className)}>
      {hasPay ? (
        <>
          <span className={SHIFT_CARD_PRICE_CLASS}>{formatMoney(payNumber ?? 0)}</span>
          <span className={SHIFT_CARD_CURRENCY_CLASS}>{currency}</span>
        </>
      ) : (
        <span className={cn(SHIFT_CARD_SUB_CLASS, 'font-semibold')}>
          {t('shift.payNegotiable')}
        </span>
      )}
    </div>
  )
}
