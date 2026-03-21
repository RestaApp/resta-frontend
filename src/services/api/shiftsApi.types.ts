/** Типы API для смен и откликов */
/**
 * Смена из API (используется для старых endpoints)
 * @deprecated Используйте VacancyApiItem для новых endpoints
 */
export interface ShiftApi {
  id: string
  title: string
  venue: string
  date: string
  time: string
  role: string
  status: 'active' | 'completed' | 'cancelled'
}

export interface CreateShiftBody {
  title: string
  description?: string
  start_time?: string
  end_time?: string
  payment?: number
  location?: string
  requirements?: string
  shift_type: 'vacancy' | 'replacement'
  urgent?: boolean
  position: string
  /** Несколько специализаций для смены */
  specializations?: string[]
}

export interface CreateShiftRequest {
  shift: CreateShiftBody
}

/** Аргументы обновления смены: id и тело без обёртки { shift } */
export interface UpdateShiftArgs {
  id: string
  body: Partial<CreateShiftBody>
}

export interface CreateShiftResponse {
  success?: boolean
  data?: VacancyApiItem
  message?: string
}

/**
 * Параметры запроса для получения вакансий
 * Только параметры, указанные в API документации
 */
export interface GetVacanciesParams {
  shift_type: 'vacancy' | 'replacement'
  position?: string // chef, waiter, bartender, barista, manager, support, delivery, cashier, operator
  specialization?: string // Специализация для фильтрации (опционально)
  city?: string // Фильтр по городу ресторана (ILIKE поиск)
  min_payment?: number // Минимальная оплата за смену
  max_payment?: number // Максимальная оплата за смену
  start_date?: string // Дата начала фильтрации (формат: YYYY-MM-DD)
  end_date?: string // Дата окончания фильтрации (формат: YYYY-MM-DD)
  urgent?: boolean // Срочные смены
  page?: number // Номер страницы для пагинации (по умолчанию: 1)
  per_page?: number // Количество смен на странице (по умолчанию: 20, макс: 100)
}

/**
 * GET /api/v1/shifts — все query-параметры опциональны (см. API.md)
 */
export interface GetShiftsListParams {
  shift_type?: 'vacancy' | 'replacement'
  position?: string
  specialization?: string
  city?: string
  min_payment?: number
  max_payment?: number
  start_date?: string
  end_date?: string
  urgent?: boolean
  page?: number
  per_page?: number
}

/**
 * Профиль ресторана из API
 */
export interface RestaurantProfileApi {
  city?: string
  cuisine_types?: string[]
  format?: string
  restaurant_format?: string
}

/**
 * Пользователь (заведение) из API
 * Используется в ответах API для вакансий
 */
export interface UserApi {
  id: number
  name: string
  full_name?: string
  city?: string
  location?: string
  bio?: string
  phone?: string
  email?: string
  photo_url?: string | null
  profile_photo_url?: string | null
  restaurant_profile?: RestaurantProfileApi
  role?: string
  average_rating?: number
  total_reviews?: number
}

export interface EmployeeProfilePreviewApi {
  experience_years?: number
  position?: string
}

export interface ApplicantUserApi {
  id: number
  name?: string
  last_name?: string
  full_name?: string
  photo_url?: string | null
  profile_photo_url?: string | null
  position?: string
  employee_profile?: EmployeeProfilePreviewApi | null
}

export interface ApplicationPreviewApiItem {
  id?: number
  shift_application_id?: number
  applied_at?: string
  message?: string | null
  priority?: number
  responded_at?: string | null
  shift_id?: number
  status?: string
  /** Статус заявки в API (pending, accepted, rejected) */
  shift_application_status?: string
  user?: ApplicantUserApi
  user_id?: number

  full_name?: string
  position?: string
  specializations?: string[]
  average_rating?: string | number
  experience_years?: number
}

export interface ReceivedShiftApplicationApiItem extends ApplicationPreviewApiItem {
  id: number
  shift_id?: number
  shift_title?: string
  shift_type?: 'vacancy' | 'replacement' | string
  shift_status?: string
}

export interface ReceivedShiftApplicationsResponse {
  success: boolean
  data: ReceivedShiftApplicationApiItem[]
  meta?: PaginationMeta
  pagination?: PaginationMeta
}

/**
 * Вакансия из API
 */
export interface VacancyApiItem {
  id: number
  title: string
  description?: string
  location?: string
  /**
   * Моя заявка на эту смену (если пользователь подавал заявку)
   */
  my_application?: {
    id: number
    applied_at?: string
    message?: string | null
    priority?: number
    responded_at?: string | null
    shift_id?: number
    status?: string
    user_id?: number
  }
  payment?: string | number
  hourly_rate?: string | number
  start_time?: string
  end_time?: string
  duration?: string
  urgent?: boolean
  shift_type?: 'vacancy' | 'replacement'
  position?: string // Позиция (chef, waiter, bartender, barista, manager, support)
  specialization?: string | null // Специализация сотрудника (одиночная, устаревший вариант)
  /** Список специализаций для вакансии/смены */
  specializations?: string[]
  target_roles?: string[]
  requirements?: string
  status?: string
  applications_count?: number
  applications_preview?: ApplicationPreviewApiItem[]
  can_apply?: boolean
  created_at?: string
  updated_at?: string
  user?: UserApi
}

/**
 * Метаданные пагинации
 */
export interface PaginationMeta {
  current_page?: number
  next_page?: number | null
  prev_page?: number | null
  per_page?: number
  total_pages?: number
  total_count?: number
}

/**
 * Ответ API с вакансиями
 */
export interface VacanciesResponse {
  success: boolean
  data: VacancyApiItem[]
  meta?: PaginationMeta
  pagination?: PaginationMeta // API может возвращать как meta, так и pagination
}

/**
 * Запрос на отклик на смену
 */
export interface ApplyToShiftRequest {
  shift_id?: number // Когда формируем тело из клиента, сюда попадёт id смены
  message?: string // Опциональное сообщение
}

/**
 * Ответ на отклик: POST /api/v1/shift_applications (201) или accept/reject
 * Для apply допускается ответ только с `data` без обёртки success (см. API.md).
 */
export interface ApplyToShiftResponse {
  success?: boolean
  message?: string
  data?: {
    id?: number
    shift_id?: number
    user_id?: number
    status?: string
    message?: string
    applied_at?: string
    responded_at?: string | null
    priority?: number
    application_id?: number
  }
}

/**
 * Ответ на отмену заявки: DELETE /api/v1/shift_applications/:id
 */
export interface CancelApplicationResponse {
  success?: boolean
  message?: string
  data?: {
    message?: string
  }
}
