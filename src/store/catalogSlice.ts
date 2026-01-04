/**
 * Redux slice для каталогов (позиции, специализации)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'

export interface CatalogState {
  positions: string[]
  specializations: Record<string, string[]> // ключ - позиция, значение - массив специализаций
  selectedPosition: string | null
}

const initialState: CatalogState = {
  positions: [],
  specializations: {},
  selectedPosition: null,
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setPositions: (state, action: PayloadAction<string[]>) => {
      state.positions = action.payload
    },
    setSpecializations: (state, action: PayloadAction<{ position: string; specializations: string[] }>) => {
      state.specializations[action.payload.position] = action.payload.specializations
    },
    setSelectedPosition: (state, action: PayloadAction<string | null>) => {
      state.selectedPosition = action.payload
    },
    clearSpecializations: (state, action: PayloadAction<string>) => {
      delete state.specializations[action.payload]
    },
  },
})

export const { setPositions, setSpecializations, setSelectedPosition, clearSpecializations } = catalogSlice.actions
export default catalogSlice.reducer

// Селекторы
export const selectPositions = (state: RootState) => state.catalog.positions
export const selectSpecializationsByPosition = (position: string) => (state: RootState) =>
  state.catalog.specializations[position] || []
export const selectSelectedPosition = (state: RootState) => state.catalog.selectedPosition
export const selectAllSpecializations = (state: RootState) => state.catalog.specializations


