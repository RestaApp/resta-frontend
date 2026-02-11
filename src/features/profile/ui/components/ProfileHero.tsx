import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { AlertCircle, CheckCircle2, Edit2, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ApiRole } from '@/types'

type ProfileHeroUser = {
  profile_photo_url?: string | null
  photo_url?: string | null
  city?: string | null
  location?: string | null
  employee_profile?: {
    open_to_work?: boolean | null
  } | null
}

interface ProfileHeroProps {
  userProfile: ProfileHeroUser
  userName: string
  roleLabel: string
  apiRole: ApiRole | null
  isProfileFilled: boolean
  onEdit: () => void
}

export const ProfileHero = memo(
  ({ userProfile, userName, roleLabel, apiRole, isProfileFilled, onEdit }: ProfileHeroProps) => {
    const { t } = useTranslation()
    const photoUrl = userProfile.profile_photo_url || userProfile.photo_url || null
    const cityOrLocation = userProfile.city || userProfile.location
    const openToWork =
      apiRole === 'employee' ? userProfile.employee_profile?.open_to_work : undefined

    return (
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-full flex items-center justify-center gradient-primary shrink-0 overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-white">{userName.charAt(0)}</span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-xl font-semibold truncate">{userName}</h2>
                {isProfileFilled ? (
                  <CheckCircle2
                    className="w-5 h-5 shrink-0"
                    style={{ color: 'var(--blue-cyber)' }}
                  />
                ) : null}
              </div>
              <div className="text-sm text-muted-foreground truncate">{roleLabel}</div>
              {cityOrLocation ? (
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground truncate">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate">{cityOrLocation}</span>
                </div>
              ) : null}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors shrink-0"
            aria-label={t('aria.editProfile')}
            type="button"
          >
            <Edit2 className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {openToWork ? <Badge variant="success">{t('profile.openToWork')}</Badge> : null}
          {isProfileFilled ? (
            <Badge variant="success">{t('common.filled')}</Badge>
          ) : (
            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              {t('common.needToFill')}
            </Badge>
          )}
        </div>
      </Card>
    )
  }
)
ProfileHero.displayName = 'ProfileHero'
