import { useTranslation } from 'react-i18next'
import { ProfileOverview } from './components/ProfileOverview'
import { Loader } from '@/components/ui/loader'
import { DetailsScreenFrame } from '@/shared/ui/shift-details-screen/DetailsScreenFrame'
import { useExternalProfileViewModel } from './useExternalProfileViewModel'

interface UserProfileOverlayProps {
  id: number
  onClose: () => void
}

export function UserProfileOverlay({ id, onClose }: UserProfileOverlayProps) {
  const { t } = useTranslation()
  const { profileViewModel, isLoading, isError } = useExternalProfileViewModel({ userId: id })

  return (
    <DetailsScreenFrame
      variant="page"
      open
      onOpenChange={open => {
        if (!open) onClose()
      }}
      onClose={onClose}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" />
        </div>
      ) : isError ? (
        <div className="text-center py-10 text-muted-foreground">{t('errors.loadError')}</div>
      ) : profileViewModel ? (
        <ProfileOverview profile={profileViewModel} variant="drawer" />
      ) : null}
    </DetailsScreenFrame>
  )
}
