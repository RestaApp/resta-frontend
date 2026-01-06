export type ShiftType = 'vacancy' | 'replacement'

export interface Shift {
  id: number | string
  title: string
  description?: string
  location?: string
  payment?: number | string
  start_time?: string
  end_time?: string
  duration?: string
  urgent?: boolean
  shift_type?: ShiftType
  position?: string
  specialization?: string | null
  status?: string
  user?: unknown
}

export interface CreateShiftPayload {
  title: string
  description?: string
  start_time: string
  end_time: string
  payment?: number
  location?: string
  requirements?: string
  shift_type: ShiftType
  urgent?: boolean
  position: string
  specialization?: string | null
}

export interface CreateShiftResponse {
  success?: boolean
  data?: Shift
  message?: string
}


