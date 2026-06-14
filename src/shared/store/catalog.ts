import { createAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

const normalizeKey = (value: string) => value.trim().toLowerCase()

export const setPositions = createAction<string[]>('catalog/setPositions')
export const setSpecializations = createAction<{ position: string; specializations: string[] }>(
  'catalog/setSpecializations'
)
export const setCities = createAction<string[]>('catalog/setCities')

const EMPTY_SPECIALIZATIONS: string[] = []

export const selectPositions = (state: RootState) => state.catalog.positions
const selectAllSpecializations = (state: RootState) => state.catalog.specializations
export const selectCities = (state: RootState) => state.catalog.cities

export const selectSpecializationsByPosition = createSelector(
  [selectAllSpecializations, (_: RootState, position: string | null) => position],
  (specializations, position) => {
    if (!position) return EMPTY_SPECIALIZATIONS
    return specializations[normalizeKey(position)] ?? EMPTY_SPECIALIZATIONS
  }
)
