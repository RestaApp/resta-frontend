/** Типы API для смен и откликов */

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

/** Ответ POST/PATCH /api/v1/shifts — render_resource(ShiftBlueprint, view: :detail) */
export interface MutateShiftResponse {
  success: boolean
  data?: VacancyApiItem
}

export interface CreateShiftResponse extends MutateShiftResponse {
  message?: string
}

/** Ответ DELETE /api/v1/shifts/:id */
export interface DeleteShiftResponse {
  success: boolean
  data?: { message?: string }
}

/**
 * Разбор оболочки success/data для GET/PATCH/POST смены.
 * Бросает, если структура не соответствует API.
 */
export function parseShiftDetailFromResponse(response: unknown): VacancyApiItem {
  if (!response || typeof response !== 'object') {
    throw new Error('Пустой ответ API смены')
  }
  const r = response as { data?: unknown }
  if (!r.data || typeof r.data !== 'object') {
    throw new Error('В ответе смены отсутствует data')
  }
  return r.data as VacancyApiItem
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

/** UserBlueprint view :basic */
export interface UserBasicApi {
  id: number
  name?: string
  role?: string
  city?: string
  average_rating?: number
  total_reviews?: number
  profile_photo_url?: string | null
  full_name?: string
}

/** ReviewBlueprint view :basic (в поле my_review смены) */
export interface ReviewBasicApi {
  id: number
  rating?: number
  comment?: string | null
  status?: string
  created_at?: string
  reviewer_name?: string
}

/** ApplicantPreviewBlueprint — пользователь-откликнувшийся в детальном просмотре смены */
export interface ApplicantPreviewApi {
  user_id: number
  full_name?: string
  position?: string
  specializations?: string[]
  average_rating?: string | number
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
 * Вложенная заявка: ShiftApplicationBlueprint view :basic даёт в основном id/status/даты;
 * остальное опционально при расширении API.
 */
export interface ShiftMyApplicationApi {
  id: number
  status?: string
  applied_at?: string
  responded_at?: string | null
  message?: string | null
  priority?: number
  shift_id?: number
  user_id?: number
}

/**
 * Вакансия / смена из API (список и детальный просмотр)
 */
export interface VacancyApiItem {
  id: number
  title: string
  description?: string
  location?: string
  /** Моя заявка (ShiftApplicationBlueprint :basic / полный) */
  my_application?: ShiftMyApplicationApi
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
  /** Поля завершённой смены и отзывов (ShiftBlueprint, ресторан) */
  can_leave_review?: boolean
  review_target?: UserBasicApi | null
  my_review?: ReviewBasicApi | null
  review_deadline?: string | null
  /** Детальный просмотр для владельца (ShiftBlueprint view :detail) */
  applicants?: ApplicantPreviewApi[]
  selected_applicant?: ApplicantPreviewApi | null
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
 * Ответ на отклик: POST shift_applications (201) с телом заявки;
 * accept/reject — чаще `{ success, data: { message } }`.
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
