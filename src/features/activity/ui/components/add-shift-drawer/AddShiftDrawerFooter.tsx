import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export const AddShiftDrawerFooter = ({
  step,
  onBackOrCancel,
  onContinue,
  onSubmit,
  isCreating,
}: {
  step: number
  onBackOrCancel: () => void
  onContinue: () => void
  onSubmit: () => void
  isCreating: boolean
}) => {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <Button variant="outline" size="md" className="w-full" onClick={onBackOrCancel}>
        {step > 0 ? t('common.back') : t('common.cancel')}
      </Button>
      {step === 2 ? (
        <Button
          variant="gradient"
          size="md"
          className="w-full"
          onClick={onSubmit}
          loading={isCreating}
        >
          {t('common.save')}
        </Button>
      ) : (
        <Button variant="gradient" size="md" className="w-full" onClick={onContinue}>
          {t('common.continue')}
        </Button>
      )}
    </div>
  )
}
