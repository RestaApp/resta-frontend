import { memo, useEffect, useMemo, useState } from 'react'
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
import { ProfileBusinessInfoCard } from './components/ProfileBusinessInfoCard'
import { ProfileSpecializationsSection } from './components/ProfileSpecializationsSection'
import { useLabels } from '@/shared/i18n/hooks'
import { Loader } from '@/components/ui/loader'
import { DRAWER_FOOTER_CLASS } from '@/components/ui/ui-patterns'
import { getProfileCompleteness } from '../model/utils/profileCompleteness'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface UserProfileDrawerProps {
  userId: number | null
  open: boolean
  onClose: () => void
  applicationId?: number | null
  canModerate?: boolean
  /** Статус заявки: при 'accepted' показывается только кнопка «Отклонить» */
  applicationStatus?: 'pending' | 'accepted'
  moderatingAction?: 'accept' | 'reject' | null
  onAccept?: () => Promise<void>
  onReject?: () => Promise<void>
}

export const UserProfileDrawer = memo(
  ({
    userId,
    open,
    onClose,
    applicationId = null,
    canModerate = false,
    applicationStatus = 'pending',
    moderatingAction = null,
    onAccept,
    onReject,
  }: UserProfileDrawerProps) => {
    const { t } = useTranslation()
    const { getUiRoleLabel, getEmployeePositionLabel } = useLabels()

    const {
      data: userResponse,
      isLoading,
      isError,
    } = useGetUserQuery(userId ?? 0, {
      skip: !userId || !open,
    })

    const userProfile = userResponse?.data
    const apiRole = useMemo(
      () => (userProfile ? mapRoleFromApi(userProfile.role) : null),
      [userProfile]
    )
    const roleLabel = useMemo(
      () => (apiRole ? getUiRoleLabel(apiRole) : ''),
      [apiRole, getUiRoleLabel]
    )
    const positionLabel = (() => {
      if (apiRole !== 'employee' || !userProfile?.employee_profile?.position) return null
      return getEmployeePositionLabel(userProfile.employee_profile.position)
    })()
    const heroRoleOrPositionLabel = positionLabel ?? roleLabel

    const userName = useMemo(() => {
      if (!userProfile) return ''
      if (apiRole === 'restaurant') {
        const venue = userProfile.restaurant_profile?.name?.trim()
        if (venue) return venue
      }
      return (
        userProfile.full_name?.trim() ||
        [userProfile.name, userProfile.last_name].filter(Boolean).join(' ').trim() ||
        userProfile.username ||
        t('common.user')
      )
    }, [userProfile, apiRole, t])

    const specializations = useMemo(() => {
      if (apiRole !== 'employee' || !userProfile?.employee_profile) return []
      return userProfile.employee_profile.specializations || []
    }, [apiRole, userProfile])

    const restaurantInfo = useMemo(() => {
      if (apiRole !== 'restaurant') return null
      return {
        format: null, // TODO: add format if available in UserData
      }
    }, [apiRole])

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

    const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false)

    useEffect(() => {
      if (!open) setRejectConfirmOpen(false)
    }, [open])

    const canReject = canModerate && typeof applicationId === 'number' && Boolean(onReject)
    const canAccept =
      canModerate &&
      typeof applicationId === 'number' &&
      Boolean(onAccept) &&
      applicationStatus !== 'accepted'
    const showModerationActions = canReject || canAccept

    return (
      <>
      <Drawer open={open} onOpenChange={isOpen => !isOpen && onClose()}>
        <div
          className="flex flex-col rounded-t-2xl bg-background min-h-0 shrink-0"
          style={{ height: 'calc(85vh - 52px)' }}
        >
          <DrawerHeader className="pb-2 border-b border-border shrink-0">
            <div className="flex items-center justify-between gap-2">
              <DrawerTitle className="text-lg font-semibold">
                {t('profile.personalInfo')}
              </DrawerTitle>
              <DrawerCloseButton onClick={onClose} ariaLabel={t('common.close')} />
            </div>
          </DrawerHeader>

          <div className="flex-1 min-h-0 overflow-y-auto ui-density-page ui-density-py">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader size="lg" />
              </div>
            ) : isError ? (
              <div className="text-center py-10 text-muted-foreground">{t('errors.loadError')}</div>
            ) : userProfile ? (
              <>
                <ProfileHero
                  userProfile={userProfile}
                  userName={userName}
                  roleLabel={heroRoleOrPositionLabel}
                  apiRole={apiRole}
                  isProfileFilled={profileCompleteness?.isFilled ?? false}
                  wrapInCard={false}
                />

                {apiRole === 'employee' && specializations.length > 0 ? (
                  <>
                    <hr className="my-4 border-border" />
                    <ProfileSpecializationsSection specializations={specializations} />
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
                    <ProfileBusinessInfoCard
                      kind="restaurant"
                      value={restaurantInfo.format}
                      variant="section"
                    />
                  </>
                ) : null}

                {apiRole === 'supplier' && supplierInfo ? (
                  <>
                    <hr className="my-4 border-border" />
                    <ProfileBusinessInfoCard
                      kind="supplier"
                      value={supplierInfo.name}
                      variant="section"
                    />
                  </>
                ) : null}
              </>
            ) : null}
          </div>

          {showModerationActions ? (
            <DrawerFooter className={`${DRAWER_FOOTER_CLASS} shrink-0`}>
              <div className="flex gap-3">
                {canReject ? (
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1"
                    loading={moderatingAction === 'reject'}
                    disabled={moderatingAction != null}
                    onClick={() => setRejectConfirmOpen(true)}
                  >
                    {moderatingAction === 'reject'
                      ? t('shift.rejectingApplication')
                      : t('shift.rejectApplication')}
                  </Button>
                ) : null}
                {canAccept ? (
                  <Button
                    variant="gradient"
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
                ) : null}
              </div>
            </DrawerFooter>
          ) : null}
        </div>
      </Drawer>

      {canReject && onReject ? (
        <ConfirmDialog
          open={rejectConfirmOpen}
          onOpenChange={setRejectConfirmOpen}
          title={t('shift.rejectApplicationConfirmTitle')}
          description={t('shift.rejectApplicationConfirmDescription')}
          cancelLabel={t('common.cancel')}
          confirmLabel={t('shift.rejectApplication')}
          onConfirm={() => {
            void (async () => {
              setRejectConfirmOpen(false)
              await onReject()
            })()
          }}
        />
      ) : null}
      </>
    )
  }
)

UserProfileDrawer.displayName = 'UserProfileDrawer'
