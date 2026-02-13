import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetMyShiftsQuery, useGetAppliedShiftsQuery } from '@/services/api/shiftsApi'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { useDeleteShift } from './useShifts'
import { useToast } from '@/hooks/useToast'
import { setLocalStorageItem } from '@/utils/localStorage'
import { toLocalISODateKey } from '@/utils/datetime'
import { STORAGE_KEYS } from '@/constants/storage'
import { normalizeVacanciesResponse } from '@/features/profile/model/utils/normalizeShiftsResponse'

export type ActivityTab = 'list' | 'calendar'

export type GroupedShift = { id: number; type: 'resta' | 'personal'; data: VacancyApiItem }

export type WeekDay = { key: string; short: string; full: string; dayNum: string; dateObj: Date }

const getDateLocale = (lang: string) => (lang === 'en' ? 'en-US' : 'ru-RU')
const getStartOfWeekMonday = (base: Date) => {
  const d = new Date(base)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export const useActivityPageModel = () => {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<ActivityTab>('list')
  const dateLocale = getDateLocale(i18n.language)

  const { data, isLoading, isError, refetch: refetchMyShifts } = useGetMyShiftsQuery()
  const { data: appliedData, isLoading: isAppliedLoading } = useGetAppliedShiftsQuery()

  const shifts = useMemo(() => normalizeVacanciesResponse(data), [data])
  const appliedShifts = useMemo(() => normalizeVacanciesResponse(appliedData), [appliedData])

  const { deleteShift, isLoading: isDeleting } = useDeleteShift()
  const { showToast } = useToast()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<VacancyApiItem | null>(null)

  const handleEdit = useCallback(
    (id: number) => {
      const found = shifts.find(s => s.id === id) || null
      setEditingShift(found)
      setIsDrawerOpen(true)
    },
    [shifts]
  )

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteShift(String(id))
        refetchMyShifts()
        showToast(t('shift.deleted'), 'success')
      } catch {
        showToast(t('shift.deleteError'), 'error')
      }
    },
    [deleteShift, refetchMyShifts, showToast, t]
  )

  // Calendar state
  const [selectedDayKey, setSelectedDayKey] = useState<string>(() => toLocalISODateKey(new Date()))

  const weekDays = useMemo<WeekDay[]>(() => {
    const today = new Date()
    const days: WeekDay[] = []

    const monday = getStartOfWeekMonday(today)

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)

      const dayNum = String(date.getDate()).padStart(2, '0')
      const shortDay = date.toLocaleDateString(dateLocale, { weekday: 'short' })
      const fullDay = date.toLocaleDateString(dateLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })

      days.push({
        key: toLocalISODateKey(date),
        short: shortDay.charAt(0).toUpperCase() + shortDay.slice(1),
        full: fullDay,
        dayNum,
        dateObj: date,
      })
    }

    return days
  }, [dateLocale])

  const groupedShifts = useMemo<Record<string, GroupedShift[]>>(() => {
    const grouped: Record<string, GroupedShift[]> = {}

    const add = (shift: VacancyApiItem, type: GroupedShift['type']) => {
      if (!shift?.start_time) return
      const date = new Date(shift.start_time)
      if (Number.isNaN(date.getTime())) return
      const dateKey = toLocalISODateKey(date)
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push({ id: shift.id, type, data: shift })
    }

    shifts.forEach(s => add(s, 'personal'))
    appliedShifts.forEach(s => add(s, 'resta'))

    return grouped
  }, [shifts, appliedShifts])

  const selectedDayShifts = useMemo<GroupedShift[]>(() => {
    if (!selectedDayKey) return []
    return groupedShifts[selectedDayKey] || []
  }, [selectedDayKey, groupedShifts])

  const handleFindShift = useCallback(() => {
    // Поведение оставляем 1-в-1: localStorage + event
    setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_FEED_SHIFTS, 'true')
    window.dispatchEvent(new CustomEvent('navigateToFeedShifts'))
  }, [])

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    setEditingShift(null)
  }, [])

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true)
  }, [])

  useEffect(() => {
    const handleOpen = () => openDrawer()
    window.addEventListener('openActivityAddShift', handleOpen)
    return () => window.removeEventListener('openActivityAddShift', handleOpen)
  }, [openDrawer])

  return {
    // tabs
    activeTab,
    setActiveTab,

    // data/loading
    isLoading,
    isAppliedLoading,
    isError,
    shifts,
    appliedShifts,

    // actions
    handleEdit,
    handleDelete,
    isDeleting,
    showToast,

    // drawer
    isDrawerOpen,
    setIsDrawerOpen,
    editingShift,
    setEditingShift,
    closeDrawer,
    openDrawer,

    // calendar
    weekDays,
    groupedShifts,
    selectedDayKey,
    setSelectedDayKey,
    selectedDayShifts,
    handleFindShift,
  }
}
