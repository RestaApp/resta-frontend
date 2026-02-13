import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { AddShiftButton } from '@/features/activity/ui/components/AddShiftButton'
import { AddShiftDrawer } from '@/features/activity/ui/components/AddShiftDrawer'
import { AddShiftOnboardingOverlay } from '@/features/activity/ui/components/AddShiftOnboardingOverlay'
import type { Tab } from '@/types'

interface AppHeaderProps {
  greetingName?: string
  onAddShift?: () => void
  activeTab?: Tab
}

export const AppHeader = ({ greetingName, onAddShift, activeTab }: AppHeaderProps) => {
  const { t } = useTranslation()
  const { userProfile } = useUserProfile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showAddShiftOnboarding, setShowAddShiftOnboarding] = useState(false)
  const addShiftButtonRef = useRef<HTMLButtonElement | null>(null)

  const rawName = greetingName ?? userProfile?.full_name ?? userProfile?.name
  const firstName =
    (typeof rawName === 'string' ? rawName.trim().split(/\s+/)[0] : '') || t('common.user')

  const isActivity = activeTab === 'activity'

  const isDrawerVisible = isActivity && drawerOpen

  const openDrawer = useCallback(() => {
    if (!isActivity) return
    setDrawerOpen(true)
    onAddShift?.()
  }, [isActivity, onAddShift])

  const dismissAddShiftOnboarding = useCallback(() => {
    setShowAddShiftOnboarding(false)
  }, [])

  const handleProxyAddShiftClick = useCallback(() => {
    dismissAddShiftOnboarding()
    addShiftButtonRef.current?.click()
  }, [dismissAddShiftOnboarding])

  const onDrawerOpenChange = (open: boolean) => {
    // если ушли с activity — drawer не может быть открыт
    if (!isActivity) {
      setDrawerOpen(false)
      return
    }
    setDrawerOpen(open)
  }

  useEffect(() => {
    const handler = () => setShowAddShiftOnboarding(true)
    window.addEventListener('showActivityAddShiftOnboarding', handler)
    return () => window.removeEventListener('showActivityAddShiftOnboarding', handler)
  }, [])

  useEffect(() => {
    if (!isActivity) return
  }, [isActivity])

  return (
    <>
      {isActivity && showAddShiftOnboarding ? (
        <AddShiftOnboardingOverlay
          visible
          targetRef={addShiftButtonRef}
          onClose={dismissAddShiftOnboarding}
          onProxyClick={handleProxyAddShiftClick}
        />
      ) : null}

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card px-4 py-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              {userProfile?.photo_url ? (
                <AvatarImage src={userProfile.photo_url} alt={firstName} />
              ) : (
                <AvatarFallback className="gradient-primary text-white">
                  {firstName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>

            <p className="text-muted-foreground">{t('greeting.hello', { name: firstName })}</p>
          </div>

          <div className="flex items-center gap-2">
            {isActivity && <AddShiftButton ref={addShiftButtonRef} onClick={openDrawer} />}
          </div>
        </div>
      </motion.header>

      {isActivity && <AddShiftDrawer open={isDrawerVisible} onOpenChange={onDrawerOpenChange} />}
    </>
  )
}
