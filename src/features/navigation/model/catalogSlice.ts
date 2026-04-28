import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/index'

interface CatalogState {
  positions: string[]
  specializations: Record<string, string[]>
  cities: string[]
}

const initialState: CatalogState = {
  positions: [],
  specializations: {},
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
    setSpecializations: (
      state,
      action: PayloadAction<{ position: string; specializations: string[] }>
    ) => {
      state.specializations[normalizeKey(action.payload.position)] = action.payload.specializations
    },
    setCities: (state, action: PayloadAction<string[]>) => {
      state.cities = action.payload
    },
  },
})

export const { setPositions, setSpecializations, setCities } = catalogSlice.actions
export default catalogSlice.reducer

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
