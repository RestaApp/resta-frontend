import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AddShiftDrawer } from '@/shared/ui/add-shift/AddShiftDrawer'
import type { ShiftType } from '@/shared/shifts/types'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { useProfileCompleteness } from '@/shared/lib/hooks/useProfileCompleteness'
import { useToast } from '@/shared/lib/hooks/useToast'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'

export function VenueAddShiftListener() {
  const { t } = useTranslation()
  const profileCompleteness = useProfileCompleteness()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [initialShiftType, setInitialShiftType] = useState<ShiftType | null>(null)
  const [editingShift, setEditingShift] = useState<VacancyApiItem | null>(null)
  // Ambient-тип для типонезависимого открытия (кнопка «+» в шапке следует за
  // активной вкладкой). Ref, а не state — читается всегда свежим, без ре-рендера.
  const currentCreateTypeRef = useRef<ShiftType>('vacancy')

  const handleCreateIntent = useCallback(
    (type: ShiftType) => {
      if (profileCompleteness?.isFilled) {
        setEditingShift(null)
        setInitialShiftType(type)
        setOpen(true)
        return
      }

      showToast(
        t('venueUi.profileRequiredToCreate', {
          defaultValue: 'Чтобы создавать вакансии и смены, сначала заполните профиль.',
        }),
        'error'
      )
    },
    [profileCompleteness?.isFilled, showToast, t]
  )

  useEffect(() => {
    const offOpenAdd = onAppEvent(APP_EVENTS.OPEN_ACTIVITY_ADD_SHIFT, detail => {
      // Тип из события (явный выбор) приоритетнее ambient-типа вкладки.
      handleCreateIntent(detail?.type ?? currentCreateTypeRef.current)
    })

    const offOpenEdit = onAppEvent(APP_EVENTS.OPEN_ACTIVITY_EDIT_SHIFT, detail => {
      const shift = (detail?.shift as VacancyApiItem | undefined) ?? null
      if (!shift) return
      setInitialShiftType(null)
      setEditingShift(shift)
      setOpen(true)
    })

    const offSetCreateType = onAppEvent(APP_EVENTS.SET_VENUE_CREATE_TYPE, detail => {
      const nextType = detail?.type
      if (nextType === 'vacancy' || nextType === 'replacement') {
        currentCreateTypeRef.current = nextType
      }
    })

    return () => {
      offOpenAdd()
      offOpenEdit()
      offSetCreateType()
    }
  }, [handleCreateIntent])

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (!next) {
      setInitialShiftType(null)
      setEditingShift(null)
    }
  }, [])

  const handleSave = useCallback(() => {
    setOpen(false)
    setInitialShiftType(null)
    setEditingShift(null)
  }, [])

  return (
    <>
      <AddShiftDrawer
        open={open}
        onOpenChange={handleOpenChange}
        onSave={handleSave}
        initialValues={editingShift}
        initialShiftType={initialShiftType}
      />
    </>
  )
}
