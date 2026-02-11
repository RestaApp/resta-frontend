import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { User, Edit2 } from 'lucide-react'

interface ProfileHeaderProps {
  userProfile?: { profile_photo_url?: string | null; photo_url?: string | null } | null
  userName: string
  roleLabel: string
  onEdit: () => void
}

export const ProfileHeader = memo(
  ({ userProfile, userName, roleLabel, onEdit }: ProfileHeaderProps) => {
    const { t } = useTranslation()
    const photoUrl = userProfile?.profile_photo_url || userProfile?.photo_url || null

    return (
      <div className="text-center relative">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
          className="absolute top-0 right-0 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          aria-label={t('aria.editProfile')}
        >
          <Edit2 className="w-5 h-5" />
        </motion.button>
        <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center gradient-primary">
          {photoUrl ? (
            <img src={photoUrl} alt={userName} className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-white" />
          )}
        </div>
        <h2 className="text-xl font-semibold mb-1">{userName}</h2>
        <p className="text-muted-foreground">{roleLabel}</p>
      </div>
    )
  }
)
ProfileHeader.displayName = 'ProfileHeader'
