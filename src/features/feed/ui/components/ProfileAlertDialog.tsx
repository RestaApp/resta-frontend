import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ProfileAlertState } from '@/features/feed/model/FeedBodyVm.types'

interface ProfileAlertDialogProps {
  state: ProfileAlertState
  onClose: () => void
  onOpenProfileEdit: () => void
}

export function ProfileAlertDialog({ state, onClose, onOpenProfileEdit }: ProfileAlertDialogProps) {
  const { t } = useTranslation()

  return (
    <AlertDialog
      open={state.open}
      onOpenChange={open => {
        if (!open) onClose()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('feed.applicationNotSent')}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>{state.message}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t('common.close')}</AlertDialogCancel>
          <AlertDialogAction onClick={onOpenProfileEdit}>
            {t('common.openProfile')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
