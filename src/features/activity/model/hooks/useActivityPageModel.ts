// src/features/activity/model/hooks/useActivityPageModel.ts
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useGetMyShiftsQuery, useGetAppliedShiftsQuery } from '@/services/api/shiftsApi'
import { useDeleteShift } from './useShifts'
import { useToast } from '@/hooks/useToast'
import { parseApiDateTime } from '@/features/feed/model/utils/formatting'
import { setLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { normalizeVacanciesResponse } from '@/features/profile/model/utils/normalizeShiftsResponse'

export type ActivityTab = 'list' | 'calendar'

type RawShift = any

export type GroupedShift = { id: number; type: 'resta' | 'personal'; data: RawShift }

export type WeekDay = { date: string; short: string; full: string; dateObj: Date }

export const useActivityPageModel = () => {
  const [activeTab, setActiveTab] = useState<ActivityTab>('list')

  const { data, isLoading, isError } = useGetMyShiftsQuery()
  const { data: appliedData, isLoading: isAppliedLoading } = useGetAppliedShiftsQuery()

  const shifts = useMemo(() => normalizeVacanciesResponse(data), [data])
  const appliedShifts = useMemo(() => normalizeVacanciesResponse(appliedData), [appliedData])

  const { deleteShift, isLoading: isDeleting } = useDeleteShift()
  const { showToast } = useToast()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<any | null>(null)

  const handleEdit = useCallback(
    (id: number) => {
      const found = shifts.find((s: any) => s.id === id) || null
      setEditingShift(found)
      setIsDrawerOpen(true)
    },
    [shifts]
  )

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteShift(String(id))
        showToast('Смена удалена', 'success')
      } catch {
        showToast('Не удалось удалить смену', 'error')
      }
    },
    [deleteShift, showToast]
  )

  // Calendar state
  const [selectedDay, setSelectedDay] = useState<string>('')

  const weekDays = useMemo<WeekDay[]>(() => {
    const today = new Date()
    const days: WeekDay[] = []

    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)

      const dayNum = date.getDate()
      const shortDay = date.toLocaleDateString('ru-RU', { weekday: 'short' })
      const fullDay = date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

      days.push({
        date: String(dayNum).padStart(2, '0'),
        short: shortDay.charAt(0).toUpperCase() + shortDay.slice(1),
        full: fullDay,
        dateObj: date,
      })
    }

    return days
  }, [])

  useEffect(() => {
    if (selectedDay || weekDays.length === 0) return

    const today = new Date()
    const todayDay = String(today.getDate()).padStart(2, '0')
    const todayInWeek = weekDays.find(d => d.date === todayDay)

    setSelectedDay(todayInWeek ? todayDay : weekDays[0].date)
  }, [selectedDay, weekDays])

  const groupedShifts = useMemo<Record<string, GroupedShift[]>>(() => {
    const grouped: Record<string, GroupedShift[]> = {}

    const add = (shift: any, type: GroupedShift['type']) => {
      if (!shift?.start_time) return
      const date = parseApiDateTime(shift.start_time)
      if (!date) return
      const dateKey = date.toISOString().split('T')[0]
      ;(grouped[dateKey] ||= []).push({ id: shift.id, type, data: shift })
    }

    shifts.forEach(s => add(s, 'personal'))
    appliedShifts.forEach(s => add(s, 'resta'))

    return grouped
  }, [shifts, appliedShifts])

  const selectedDayShifts = useMemo<GroupedShift[]>(() => {
    const selectedDayObj = weekDays.find(d => d.date === selectedDay)
    if (!selectedDayObj) return []
    const dateKey = selectedDayObj.dateObj.toISOString().split('T')[0]
    return groupedShifts[dateKey] || []
  }, [selectedDay, weekDays, groupedShifts])

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
    selectedDay,
    setSelectedDay,
    selectedDayShifts,
    handleFindShift,
  }
}
