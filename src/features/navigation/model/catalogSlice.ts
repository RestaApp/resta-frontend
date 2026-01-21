import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/index'

export interface CatalogState {
  positions: string[]
  specializations: Record<string, string[]>
  selectedPosition: string | null
  cities: string[]
}

const initialState: CatalogState = {
  positions: [],
  specializations: {},
  selectedPosition: null,
  cities: [],
}

const normalizeKey = (value: string) => value.trim().toLowerCase()

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setPositions: (state, action: PayloadAction<string[]>) => {
      state.positions = action.payload
    },
    setSpecializations: (state, action: PayloadAction<{ position: string; specializations: string[] }>) => {
      state.specializations[normalizeKey(action.payload.position)] = action.payload.specializations
    },
    setSelectedPosition: (state, action: PayloadAction<string | null>) => {
      state.selectedPosition = action.payload
    },
    clearSpecializations: (state, action: PayloadAction<string>) => {
      delete state.specializations[normalizeKey(action.payload)]
    },
    setCities: (state, action: PayloadAction<string[]>) => {
      state.cities = action.payload
    },
  },
})

export const { setPositions, setSpecializations, setSelectedPosition, clearSpecializations, setCities } =
  catalogSlice.actions
export default catalogSlice.reducer

const EMPTY_SPECIALIZATIONS: string[] = []

export const selectPositions = (state: RootState) => state.catalog.positions
export const selectSelectedPosition = (state: RootState) => state.catalog.selectedPosition
export const selectAllSpecializations = (state: RootState) => state.catalog.specializations
export const selectCities = (state: RootState) => state.catalog.cities

export const selectSpecializationsByPosition = createSelector(
  [selectAllSpecializations, (_: RootState, position: string | null) => position],
  (specializations, position) => {
    if (!position) return EMPTY_SPECIALIZATIONS
    return specializations[normalizeKey(position)] ?? EMPTY_SPECIALIZATIONS
  }
)