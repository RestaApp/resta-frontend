import { UserProfileDrawer } from './UserProfileDrawer'

interface UserProfileOverlayProps {
  id: number
  onClose: () => void
}

/** Deep-link overlay: drawer профиля для DetailOverlayRenderer. */
export function UserProfileOverlay({ id, onClose }: UserProfileOverlayProps) {
  return <UserProfileDrawer userId={id} open onClose={onClose} />
}
