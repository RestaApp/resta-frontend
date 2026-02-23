import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerCloseButton,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useGetUserQuery } from '@/services/api/usersApi'
import { mapRoleFromApi } from '@/utils/roles'
import { ProfileHero } from './components/ProfileHero'
import { ProfileInfoCard } from './components/ProfileInfoCard'
import { useLabels } from '@/shared/i18n/hooks'
import { Card } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { getProfileCompleteness } from '../model/utils/profileCompleteness'
import { ChefHat } from 'lucide-react'

interface UserProfileDrawerProps {
  userId: number | null
  open: boolean
  onClose: () => void
  applicationId?: number | null
  canModerate?: boolean
  moderatingAction?: 'accept' | 'reject' | null
  onAccept?: () => Promise<void>
  onReject?: () => Promise<void>
}

const SpecializationsSection = memo(({ specializations }: { specializations: string[] }) => {
  const { t } = useTranslation()
  const { getSpecializationLabel } = useLabels()
  if (specializations.length === 0) return null

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ChefHat className="w-5 h-5" style={{ color: 'var(--purple-deep)' }} />
        {t('profile.specializationSection')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {specializations.map((spec: string) => (
          <span key={spec} className="px-4 py-2 rounded-full text-white text-sm gradient-primary">
            {getSpecializationLabel(spec)}
          </span>
        ))}
      </div>
    </div>
  )
})
SpecializationsSection.displayName = 'SpecializationsSection'

const RestaurantInfoCard = memo(
  ({
    restaurantInfo,
    variant = 'card',
  }: {
    restaurantInfo: { name: string; format: string | null }
    variant?: 'card' | 'section'
  }) => {
    const { t } = useTranslation()
    const content = (
      <>
        <h4 className="font-semibold mb-3">{t('roles.venueInfoTitle')}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('profile.venueName')}</span>
            <span>{restaurantInfo.name}</span>
          </div>
          {restaurantInfo.format && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('profile.venueType')}</span>
              <span>{restaurantInfo.format}</span>
            </div>
          )}
        </div>
      </>
    )
    return variant === 'section' ? (
      <div className="py-2">{content}</div>
    ) : (
      <Card className="p-5">{content}</Card>
    )
  }
)
RestaurantInfoCard.displayName = 'RestaurantInfoCard'

const SupplierInfoCard = memo(
  ({
    supplierInfo,
    variant = 'card',
  }: {
    supplierInfo: { name: string }
    variant?: 'card' | 'section'
  }) => {
    const { t } = useTranslation()
    const content = (
      <>
        <h4 className="font-semibold mb-3">{t('roles.supplierInfoTitle')}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('profile.companyName')}</span>
            <span>{supplierInfo.name}</span>
          </div>
        </div>
      </>
    )
    return variant === 'section' ? (
      <div className="py-2">{content}</div>
    ) : (
      <Card className="p-5">{content}</Card>
    )
  }
)
SupplierInfoCard.displayName = 'SupplierInfoCard'

export const UserProfileDrawer = memo(
  ({
    userId,
    open,
    onClose,
    applicationId = null,
    canModerate = false,
    moderatingAction = null,
    onAccept,
    onReject,
  }: UserProfileDrawerProps) => {
    const { t } = useTranslation()
    const { getUiRoleLabel } = useLabels()

    const { data: userResponse, isLoading, isError } = useGetUserQuery(userId ?? 0, {
      skip: !userId || !open,
    })

    const userProfile = userResponse?.data
    const apiRole = useMemo(() => (userProfile ? mapRoleFromApi(userProfile.role) : null), [userProfile])
    const roleLabel = useMemo(() => (apiRole ? getUiRoleLabel(apiRole) : ''), [apiRole, getUiRoleLabel])

    const userName = useMemo(() => {
      if (!userProfile) return ''
      return (
        userProfile.full_name?.trim() ||
        [userProfile.name, userProfile.last_name].filter(Boolean).join(' ').trim() ||
        userProfile.username ||
        t('common.user')
      )
    }, [userProfile, t])

    const specializations = useMemo(() => {
      if (apiRole !== 'employee' || !userProfile?.employee_profile) return []
      return userProfile.employee_profile.specializations || []
    }, [apiRole, userProfile])

    const restaurantInfo = useMemo(() => {
      if (apiRole !== 'restaurant') return null
      return {
        name: userProfile?.full_name || userProfile?.name || t('venue'),
        format: null, // TODO: add format if available in UserData
      }
    }, [apiRole, userProfile, t])

    const supplierInfo = useMemo(() => {
      if (apiRole !== 'supplier') return null
      return {
        name: userProfile?.full_name || userProfile?.name || t('company'),
      }
    }, [apiRole, userProfile, t])

    const profileCompleteness = useMemo(() => {
      if (!userProfile) return null
      return getProfileCompleteness(userProfile, apiRole)
    }, [userProfile, apiRole])

    const showModerationActions =
      canModerate && typeof applicationId === 'number' && Boolean(onAccept) && Boolean(onReject)

    return (
      <Drawer open={open} onOpenChange={isOpen => !isOpen && onClose()}>
        <div
          className="flex flex-col rounded-t-2xl bg-background min-h-0 shrink-0"
          style={{ height: 'calc(85vh - 52px)' }}
        >
          <DrawerHeader className="pb-2 border-b border-border shrink-0">
            <div className="flex items-center justify-between gap-2">
              <DrawerTitle className="text-lg font-semibold">{t('profile.personalInfo')}</DrawerTitle>
              <DrawerCloseButton onClick={onClose} ariaLabel={t('common.close')} />
            </div>
          </DrawerHeader>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader size="lg" />
              </div>
            ) : isError ? (
              <div className="text-center py-10 text-muted-foreground">
                {t('errors.loadError')}
              </div>
            ) : userProfile ? (
              <>
                <ProfileHero
                  userProfile={userProfile}
                  userName={userName}
                  roleLabel={roleLabel}
                  apiRole={apiRole}
                  isProfileFilled={profileCompleteness?.isFilled ?? false}
                  wrapInCard={false}
                />

                {apiRole === 'employee' && specializations.length > 0 ? (
                  <>
                    <hr className="my-4 border-border" />
                    <SpecializationsSection specializations={specializations} />
                  </>
                ) : null}

                <hr className="my-4 border-border" />
                <ProfileInfoCard
                  apiRole={apiRole}
                  userProfile={userProfile}
                  completeness={profileCompleteness}
                  defaultOpen={true}
                  variant="section"
                />

                {apiRole === 'restaurant' && restaurantInfo ? (
                  <>
                    <hr className="my-4 border-border" />
                    <RestaurantInfoCard restaurantInfo={restaurantInfo} variant="section" />
                  </>
                ) : null}

                {apiRole === 'supplier' && supplierInfo ? (
                  <>
                    <hr className="my-4 border-border" />
                    <SupplierInfoCard supplierInfo={supplierInfo} variant="section" />
                  </>
                ) : null}
              </>
            ) : null}
          </div>

          {showModerationActions ? (
            <DrawerFooter className="border-t border-border bg-background shrink-0">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1"
                  loading={moderatingAction === 'reject'}
                  disabled={moderatingAction != null}
                  onClick={onReject}
                >
                  {moderatingAction === 'reject'
                    ? t('shift.rejectingApplication')
                    : t('shift.rejectApplication')}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  loading={moderatingAction === 'accept'}
                  disabled={moderatingAction != null}
                  onClick={onAccept}
                >
                  {moderatingAction === 'accept'
                    ? t('shift.acceptingApplication')
                    : t('shift.acceptApplication')}
                </Button>
              </div>
            </DrawerFooter>
          ) : null}
        </div>
      </Drawer>
    )
  })

UserProfileDrawer.displayName = 'UserProfileDrawer'
