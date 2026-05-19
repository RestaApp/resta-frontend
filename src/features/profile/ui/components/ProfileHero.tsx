import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Briefcase, Link2, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SCREEN_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/utils/cn'
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
  /** Активная PRO-подписка — рендерит бейдж `PRO`. Бэк-источник: GET /billing/subscription. */
  hasProSubscription?: boolean
  /** Своё профиль: открыть форму заполнения (если профиль неполный) */
  onFillProfile?: () => void
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
    hasProSubscription = false,
    onFillProfile,
    wrapInCard = true,
  }: ProfileHeroProps) => {
    const { t } = useTranslation()
    const photoUrl = userProfile.photo_url || userProfile.profile_photo_url || null
    const cityOrLocation = userProfile.city || userProfile.location
    const openToWork =
      apiRole === 'employee' ? userProfile.employee_profile?.open_to_work : undefined

    const content = (
      <>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary shrink-0 overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-white">{userName.charAt(0)}</span>
              )}
            </div>

            <div className="min-w-0">
              <h1 className={cn(SCREEN_TITLE_CLASS, 'truncate')}>{userName}</h1>
              <div className="text-sm text-muted-foreground truncate">{roleLabel}</div>
              {cityOrLocation ? (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground truncate font-mono-resta">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{cityOrLocation}</span>
                </div>
              ) : null}
              {isProfileFilled || hasProSubscription ? (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {hasProSubscription ? <Badge variant="pro">PRO</Badge> : null}
                </div>
              ) : null}
            </div>
          </div>

          {openToWork ? (
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <span title={t('profile.openToWork')} aria-label={t('profile.openToWork')}>
                <Badge variant="success" className="h-11 w-11 px-0 py-0 justify-center">
                  <Briefcase className="w-4 h-4" />
                </Badge>
              </span>
            </div>
          ) : null}
        </div>

        {apiRole === 'employee' && isProfileFilled ? (
          <div className="mt-3 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-mono-resta text-xs text-primary truncate">
              resta.me/{userName.toLowerCase().replace(/\s+/g, '-')}
            </span>
          </div>
        ) : null}

        {!isProfileFilled ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="border border-warning/25 bg-warning/10 text-warning">
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{t('common.needToFill')}</span>
              </span>
            </Badge>
            {onFillProfile ? (
              <button
                type="button"
                onClick={onFillProfile}
                className="text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                {t('common.fill')}
              </button>
            ) : null}
          </div>
        ) : null}
      </>
    )
    return wrapInCard ? (
      <Card className="relative p-4">{content}</Card>
    ) : (
      <div className="relative py-1">{content}</div>
    )
  }
)
ProfileHero.displayName = 'ProfileHero'
