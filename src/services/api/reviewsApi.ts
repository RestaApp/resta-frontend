/**
 * Отзывы и рейтинги — resources :reviews
 */

import { api } from '@/shared/api/api'
import type { PaginationMeta } from './shiftsApi.types'

export interface ReviewApi {
  id: number
  rating: number
  comment?: string | null
  status?: string
  anonymous?: boolean
  metadata?: Record<string, unknown> | null
  created_at?: string
  updated_at?: string
  reviewer_name?: string
  reviewed_name?: string
  formatted_rating?: string
  short_comment?: string
  reviewer?: unknown
  reviewed?: unknown
}

export interface ReviewsListResponse {
  success: boolean
  data: ReviewApi[]
  pagination?: PaginationMeta
}

export interface ReviewItemResponse {
  success: boolean
  data: ReviewApi
}

export interface CreateReviewRequest {
  review: {
    reviewed_id: number
    reviewable_type: string
    reviewable_id: number
    rating: number
    comment?: string | null
    anonymous?: boolean
  }
}

export interface UpdateReviewRequest {
  review: Partial<{
    rating: number
    comment: string | null
    anonymous: boolean
  }>
}

export interface DestroyReviewResponse {
  success: boolean
  data?: { message?: string }
}

export const reviewsApi = api.injectEndpoints({
  endpoints: builder => ({
    getReviews: builder.query<ReviewsListResponse, void>({
      query: () => '/api/v1/reviews',
      providesTags: result =>
        result?.data?.length
          ? [
              { type: 'Review' as const, id: 'LIST' },
              ...result.data.map(r => ({ type: 'Review' as const, id: String(r.id) })),
            ]
          : [{ type: 'Review' as const, id: 'LIST' }],
    }),

    getReview: builder.query<ReviewItemResponse, number>({
      query: id => `/api/v1/reviews/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Review', id: String(id) }],
    }),

    createReview: builder.mutation<ReviewItemResponse, CreateReviewRequest>({
      query: body => ({
        url: '/api/v1/reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Review', id: 'LIST' }, { type: 'Shift', id: 'LIST' }, 'User'],
    }),

    updateReview: builder.mutation<ReviewItemResponse, { id: number; body: UpdateReviewRequest }>({
      query: ({ id, body }) => ({
        url: `/api/v1/reviews/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Review', id: String(id) },
        { type: 'Review', id: 'LIST' },
        { type: 'Shift', id: 'LIST' },
        'User',
      ],
    }),

    deleteReview: builder.mutation<DestroyReviewResponse, number>({
      query: id => ({
        url: `/api/v1/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Review', id: String(id) },
        { type: 'Review', id: 'LIST' },
        { type: 'Shift', id: 'LIST' },
        'User',
      ],
    }),
  }),
})

export const {
  useGetReviewsQuery,
  useGetReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi
