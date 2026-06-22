/** Стандартные метаданные пагинации (Kaminari на бэке). Общий тип для всех *Api. */
export interface PaginationMeta {
  current_page?: number
  next_page?: number | null
  prev_page?: number | null
  per_page?: number
  total_pages?: number
  total_count?: number
}
