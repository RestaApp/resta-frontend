import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { useGetMyShiftsQuery, useGetAppliedShiftsQuery } from '@/services/api/shiftsApi'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { useDeleteShift } from './useShifts'
import { useToast } from '@/hooks/useToast'
import { useSuccessOverlay } from '@/hooks/useSuccessOverlay'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole } from '@/features/navigation/model/userSlice'
import { getLocalStorageItem, removeLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { normalizeVacanciesResponse } from '@/features/profile/model/utils/normalizeShiftsResponse'
import { useProfileCompleteness } from '@/features/profile/model/hooks/useProfileCompleteness'
import { useAuth } from '@/contexts/auth'
import { APP_EVENTS, emitAppEvent, onAppEvent } from '@/shared/utils/appEvents'

export type ActivityTab = 'applications' | 'shifts'

export const useActivityPageModel = (defaultTab: ActivityTab = 'applications') => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const selectedRole = useAppSelector(selectSelectedRole)
  const isVenue = selectedRole === 'venue'
  const isSupplier = selectedRole === 'supplier'
  const [activeTab, setActiveTab] = useState<ActivityTab>(defaultTab)

  const {
    data,
    isLoading,
    isError,
    refetch: refetchMyShifts,
  } = useGetMyShiftsQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnFocus: false,
  })
  const {
    data: appliedData,
    isLoading: isAppliedLoading,
    refetch: refetchAppliedShifts,
  } = useGetAppliedShiftsQuery(undefined, {
    skip: isVenue || isSupplier || !isAuthenticated,
    refetchOnFocus: false,
  })

  const shifts = useMemo(() => normalizeVacanciesResponse(data), [data])
  const appliedShifts = useMemo(() => normalizeVacanciesResponse(appliedData), [appliedData])

  const { deleteShift, isLoading: isDeleting } = useDeleteShift()
  const { toast, showToast, hideToast } = useToast()
  const { successState, showSuccess, closeSuccess } = useSuccessOverlay()
  const profileCompleteness = useProfileCompleteness()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<VacancyApiItem | null>(null)

  const handleEdit = useCallback(
    (id: number) => {
      const found = shifts.find(s => s.id === id) || null
      if (isVenue) {
        if (found) {
          emitAppEvent(APP_EVENTS.OPEN_ACTIVITY_EDIT_SHIFT, { shift: found })
        }
        return
      }
      setEditingShift(found)
      setIsDrawerOpen(true)
    },
    [isVenue, shifts]
  )

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteShift(String(id))
        showSuccess({
          title: t('shift.deleted'),
          description: t('shift.deletedDescription', {
            defaultValue: 'Смена удалена и больше не показывается соискателям.',
          }),
          icon: Trash2,
          primaryAction: { label: t('common.close'), onClick: closeSuccess, variant: 'gradient' },
        })
      } catch {
        showToast(t('shift.deleteError'), 'error')
      }
    },
    [deleteShift, showToast, showSuccess, closeSuccess, t]
  )

  const refreshList = useCallback(async () => {
    if (isVenue || isSupplier) {
      await refetchMyShifts()
      return
    }
    await Promise.all([refetchMyShifts(), refetchAppliedShifts()])
  }, [isSupplier, isVenue, refetchMyShifts, refetchAppliedShifts])

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    setEditingShift(null)
  }, [])

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true)
  }, [])

  const handleOpenAddShiftFromEvent = useCallback(() => {
    if (isVenue) return
    if (!profileCompleteness.isFilled) {
      showToast(
        t('venueUi.profileRequiredToCreate', {
          defaultValue: 'Чтобы создавать вакансии и смены, сначала заполните профиль.',
        }),
        'warning'
      )
      return
    }
    openDrawer()
  }, [isVenue, openDrawer, profileCompleteness.isFilled, showToast, t])

  useEffect(() => {
    return onAppEvent(APP_EVENTS.OPEN_ACTIVITY_ADD_SHIFT, () => handleOpenAddShiftFromEvent())
  }, [handleOpenAddShiftFromEvent])

  useEffect(() => {
    if (isLoading) return
    const editIdRaw = getLocalStorageItem(STORAGE_KEYS.EDIT_SHIFT_ID)
    if (!editIdRaw) return
    const editId = Number(editIdRaw)
    removeLocalStorageItem(STORAGE_KEYS.EDIT_SHIFT_ID)
    if (!Number.isFinite(editId)) return
    const found = shifts.find(s => s.id === editId) || null
    if (found) {
      queueMicrotask(() => {
        setEditingShift(found)
        setIsDrawerOpen(true)
      })
    }
  }, [shifts, isLoading])

  return {
    activeTab,
    setActiveTab,
    isLoading,
    isAppliedLoading,
    isError,
    shifts,
    appliedShifts,
    handleEdit,
    handleDelete,
    refreshList,
    isDeleting,
    showToast,
    toast,
    hideToast,
    successState,
    closeSuccess,
    isDrawerOpen,
    setIsDrawerOpen,
    editingShift,
    setEditingShift,
    closeDrawer,
    openDrawer,
  }
}
