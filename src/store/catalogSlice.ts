/**
 * Redux slice для каталогов (позиции, специализации)
 */

import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'

export interface CatalogState {
  positions: string[]
  specializations: Record<string, string[]> // ключ - позиция, значение - массив специализаций
  selectedPosition: string | null
  cities: string[]
}

const initialState: CatalogState = {
  positions: [],
  specializations: {},
  selectedPosition: null,
  cities: [],
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setPositions: (state, action: PayloadAction<string[]>) => {
      state.positions = action.payload
    },
    setSpecializations: (state, action: PayloadAction<{ position: string; specializations: string[] }>) => {
      // Нормализуем позицию к lowercase для консистентности
      const normalizedPosition = action.payload.position.toLowerCase()
      state.specializations[normalizedPosition] = action.payload.specializations
    },
    setSelectedPosition: (state, action: PayloadAction<string | null>) => {
      state.selectedPosition = action.payload
    },
    clearSpecializations: (state, action: PayloadAction<string>) => {
      delete state.specializations[action.payload]
    },
    setCities: (state, action: PayloadAction<string[]>) => {
      state.cities = action.payload
    },
  },
})

export const { setPositions, setSpecializations, setSelectedPosition, clearSpecializations, setCities } = catalogSlice.actions
export default catalogSlice.reducer

const EMPTY_SPECIALIZATIONS: string[] = []

// Селекторы
export const selectPositions = (state: RootState) => state.catalog.positions
const selectCatalogSpecializations = (state: RootState) => state.catalog.specializations
export const selectSpecializationsByPosition = createSelector(
  [selectCatalogSpecializations, (_: RootState, position: string | null) => position],
  (specializations, position) => {
    if (!position) return EMPTY_SPECIALIZATIONS
    const normalizedPosition = position.toLowerCase()
    return specializations[normalizedPosition] || EMPTY_SPECIALIZATIONS
  }
)
export const selectSelectedPosition = (state: RootState) => state.catalog.selectedPosition
export const selectAllSpecializations = (state: RootState) => state.catalog.specializations
export const selectCities = (state: RootState) => state.catalog.cities


