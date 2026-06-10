import { useTranslation } from 'react-i18next'
import { ProfileOverview } from './components/ProfileOverview'
import { ProfileSkeleton } from '@/components/ui/profile-skeleton'
import { ErrorState } from '@/components/ui/states'
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
        <ProfileSkeleton variant="drawer" className="ui-density-page ui-density-py" />
      ) : isError ? (
        <ErrorState title={t('errors.loadError')} className="min-h-0 py-10" />
      ) : profileViewModel ? (
        <ProfileOverview profile={profileViewModel} variant="drawer" />
      ) : null}
    </DetailsScreenFrame>
  )
}
