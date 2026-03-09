import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const AddShiftDrawerSuccess = () => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-10 px-2 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-3">
        <CheckCircle2 className="w-9 h-9 text-success" strokeWidth={1.6} />
      </div>
      <p className="text-foreground font-semibold text-center mb-1">{t('shift.created')}</p>
      <p className="text-muted-foreground text-sm text-center max-w-[320px]">
        {t('shift.createdConfirmation')}
      </p>
    </div>
  )
}
