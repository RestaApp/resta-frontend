/**
 * API отзывов. Спецификация: API.md «Отзывы».
 * Отзыв можно оставить только участнику завершённой смены ресторана
 * (см. поля can_leave_review / review_target смены).
 */

import { api } from '@/shared/api/api'

/** Пользователь в составе отзыва (ReviewBlueprint → association UserBlueprint). */
export interface ReviewUser {
  id: number
  name?: string
  full_name?: string
  role?: string
  profile_photo_url?: string | null
}

/** Элемент GET /api/v1/reviews (ReviewBlueprint, default view). */
export interface ReviewItem {
  id: number
  rating: number
  comment: string | null
  status: string
  anonymous?: boolean
  created_at?: string
  reviewer_name?: string
  reviewed_name?: string
  reviewer?: ReviewUser
  reviewed?: ReviewUser
}

export interface ReviewsListResponse {
  success: boolean
  data: ReviewItem[]
}

export interface GetReviewsParams {
  /**
   * ID оцениваемого пользователя. Обязателен: бэкенд `GET /reviews` делает
   * `params.require(:reviewed_id)` и фильтрует по нему (`.where(reviewed_id:).approved`),
   * без него вернётся 422.
   */
  reviewed_id: number
  page?: number
  per_page?: number
}

export interface CreateReviewArgs {
  /** Кого оцениваем (review_target.id смены) */
  reviewedId: number
  /** Смена, к которой привязан отзыв */
  shiftId: number
  rating: number
  comment?: string
  anonymous?: boolean
}

export interface CreateReviewResponse {
  success?: boolean
  data?: {
    id: number
    rating: number
    comment: string | null
    status: string
  }
  errors?: string[]
}

export const reviewsApi = api.injectEndpoints({
  endpoints: builder => ({
    // Лента отзывов о пользователе. Кэш привязан к тегу User оцениваемого,
    // поэтому createReview (invalidatesTags User) обновляет ленту.
    getReviews: builder.query<ReviewsListResponse, GetReviewsParams>({
      query: params => ({
        url: '/api/v1/reviews',
        method: 'GET',
        params,
      }),
      providesTags: (_result, _error, { reviewed_id }) =>
        reviewed_id != null ? [{ type: 'User', id: reviewed_id }] : [],
    }),

    createReview: builder.mutation<CreateReviewResponse, CreateReviewArgs>({
      query: ({ reviewedId, shiftId, rating, comment, anonymous }) => ({
        url: '/api/v1/reviews',
        method: 'POST',
        body: {
          review: {
            reviewed_id: reviewedId,
            reviewable_type: 'Shift',
            reviewable_id: shiftId,
            rating,
            comment: comment?.trim() || undefined,
            anonymous: anonymous ?? false,
          },
        },
      }),
      // Обновляем смену (my_review / can_leave_review) и рейтинг оценённого юзера.
      // 'Notification' — бэк при POST /reviews авто-архивирует связанное напоминание
      // review_reminder (см. API.md «Создание отзыва»); инвалидация обновляет инбокс
      // и колокол сразу, а не на следующем поллинге has_unread.
      invalidatesTags: (_result, _error, { shiftId, reviewedId }) => [
        { type: 'Shift', id: String(shiftId) },
        { type: 'User', id: reviewedId },
        'Notification',
      ],
    }),
  }),
})

export const { useGetReviewsQuery, useCreateReviewMutation } = reviewsApi
