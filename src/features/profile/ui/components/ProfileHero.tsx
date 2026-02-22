import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Briefcase, CheckCircle2, MapPin } from 'lucide-react'
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
  /** В drawer профиля кандидата — без карточки, только контент */
  wrapInCard?: boolean
}

export const ProfileHero = memo(
  ({
    userProfile,
    userName,
    roleLabel,
    apiRole,
    isProfileFilled,
    wrapInCard = true,
  }: ProfileHeroProps) => {
    const { t } = useTranslation()
    const photoUrl = userProfile.profile_photo_url || userProfile.photo_url || null
    const cityOrLocation = userProfile.city || userProfile.location
    const openToWork =
      apiRole === 'employee' ? userProfile.employee_profile?.open_to_work : undefined

    const content = (
      <>
        {openToWork ? (
          <span
            className="absolute top-4 right-4"
            title={t('profile.openToWork')}
            aria-label={t('profile.openToWork')}
          >
            <Badge variant="success" className="h-9 w-9 px-0 py-0 justify-center">
              <Briefcase className="w-4 h-4" />
            </Badge>
          </span>
        ) : null}

        <div className="flex items-start gap-3">
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
        </div>

        {!isProfileFilled ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              {t('common.needToFill')}
            </Badge>
          </div>
        ) : null}
      </>
    )
    return wrapInCard ? (
      <Card className="relative p-5">{content}</Card>
    ) : (
      <div className="relative py-1">{content}</div>
    )
  }
)
ProfileHero.displayName = 'ProfileHero'
