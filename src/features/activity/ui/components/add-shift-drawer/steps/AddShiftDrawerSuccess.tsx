import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BODY_MUTED_CLASS, STATE_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/utils/cn'

export const AddShiftDrawerSuccess = () => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-10 px-2 animate-fade-in">
      <div
        className="grid h-18 w-18 place-items-center rounded-lg bg-success text-white shadow-[var(--shadow-success-cta)]"
        aria-hidden
      >
        <Check className="h-9 w-9" strokeWidth={2.2} />
      </div>
      <h2 className={cn(STATE_TITLE_CLASS, 'mt-4 text-center')}>{t('shift.created')}</h2>
      <p className={cn(BODY_MUTED_CLASS, 'mt-2 max-w-xs text-center leading-snug')}>
        {t('shift.createdConfirmation')}
      </p>
    </div>
  )
}
