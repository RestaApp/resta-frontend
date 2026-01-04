/**
 * Redux slice для каталогов (позиции, специализации)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface CatalogState {
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


