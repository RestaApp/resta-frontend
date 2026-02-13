import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export const AddShiftDrawerFooter = ({
  isSuccessOpen,
  step,
  onBackOrCancel,
  onContinue,
  onSubmit,
  isCreating,
  onCreateAnother,
  onClose,
}: {
  isSuccessOpen: boolean
  step: number
  onBackOrCancel: () => void
  onContinue: () => void
  onSubmit: () => void
  isCreating: boolean
  onCreateAnother: () => void
  onClose: () => void
}) => {
  const { t } = useTranslation()

  if (isSuccessOpen) {
    return (
      <div className="grid grid-cols-2 gap-3 w-full">
        <Button variant="outline" size="md" className="w-full" onClick={onCreateAnother}>
          {t('shift.createAnother')}
        </Button>
        <Button variant="gradient" size="md" className="w-full" onClick={onClose}>
          {t('common.close')}
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <Button variant="outline" size="md" className="w-full" onClick={onBackOrCancel}>
        {step === 0 ? t('common.cancel') : t('common.back')}
      </Button>
      {step === 2 ? (
        <Button variant="gradient" size="md" className="w-full" onClick={onSubmit} loading={isCreating}>
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

