import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AddShiftDrawer } from '@/features/activity/ui/components/AddShiftDrawer'
import type { ShiftType } from '@/features/activity/model/hooks/useAddShiftForm'
import { useProfileCompleteness } from '@/features/profile/model/utils/profileCompleteness'
import { setLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { useToast } from '@/hooks/useToast'
import { Toast } from '@/components/ui/toast'

export function VenueAddShiftListener() {
  const { t } = useTranslation()
  const profileCompleteness = useProfileCompleteness()
  const { toast, showToast, hideToast } = useToast()
  const [open, setOpen] = useState(false)
  const [currentCreateType, setCurrentCreateType] = useState<ShiftType>('vacancy')
  const [initialShiftType, setInitialShiftType] = useState<ShiftType | null>(null)

  const openProfileEdit = useCallback(() => {
    setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT, 'true')
    window.dispatchEvent(new CustomEvent('navigateToProfileEdit'))
    window.dispatchEvent(new CustomEvent('openProfileEdit'))
  }, [])

  const handleCreateIntent = useCallback(() => {
    if (profileCompleteness?.isFilled) {
      setInitialShiftType(currentCreateType)
      setOpen(true)
      return
    }

    showToast(
      t('venueUi.profileRequiredToCreate', {
        defaultValue: 'Чтобы создавать вакансии и смены, сначала заполните профиль.',
      }),
      'error'
    )
    openProfileEdit()
  }, [currentCreateType, openProfileEdit, profileCompleteness?.isFilled, showToast, t])

  useEffect(() => {
    const handleOpenAdd = () => handleCreateIntent()
    const handleSetCreateType = (event: Event) => {
      const customEvent = event as CustomEvent<{ type?: ShiftType }>
      const nextType = customEvent.detail?.type
      if (nextType === 'vacancy' || nextType === 'replacement') {
        setCurrentCreateType(nextType)
      }
    }

    window.addEventListener('openActivityAddShift', handleOpenAdd)
    window.addEventListener('setVenueCreateType', handleSetCreateType)

    return () => {
      window.removeEventListener('openActivityAddShift', handleOpenAdd)
      window.removeEventListener('setVenueCreateType', handleSetCreateType)
    }
  }, [handleCreateIntent])

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (!next) {
      setInitialShiftType(null)
    }
  }, [])

  const handleSave = useCallback(() => {
    setOpen(false)
    setInitialShiftType(null)
  }, [])

  return (
    <>
      <AddShiftDrawer
        open={open}
        onOpenChange={handleOpenChange}
        onSave={handleSave}
        initialShiftType={initialShiftType}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  )
}
