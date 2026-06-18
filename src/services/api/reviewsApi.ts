/**
 * API отзывов. Спецификация: API.md «Отзывы».
 * Отзыв можно оставить только участнику завершённой смены ресторана
 * (см. поля can_leave_review / review_target смены).
 */

import { api } from '@/shared/api/api'

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
      // Обновляем смену (my_review / can_leave_review) и рейтинг пользователя.
      invalidatesTags: (_result, _error, { shiftId }) => [
        { type: 'Shift', id: String(shiftId) },
        'User',
      ],
    }),
  }),
})

export const { useCreateReviewMutation } = reviewsApi
