/**
 * API обращений в поддержку.
 * Спецификация: POST /api/v1/support_tickets
 */

import { api } from '@/shared/api/api'

export const SUPPORT_TICKET_CATEGORIES = [
  'technical_issue',
  'account_issue',
  'feature_request',
  'general_inquiry',
  'onboarding_issue',
] as const

export type SupportTicketCategory = (typeof SUPPORT_TICKET_CATEGORIES)[number]

export type SupportTicketStatus =
  | 'new'
  | 'in_progress'
  | 'waiting_for_user'
  | 'resolved'
  | 'reopened'

export interface SupportTicket {
  id: number
  subject: string
  category: SupportTicketCategory
  category_label: string
  status: SupportTicketStatus
  status_label: string
  created_at: string
}

export interface CreateSupportTicketRequest {
  support_ticket: {
    subject: string
    initial_message: string
    category: SupportTicketCategory
    contact_info?: string
    metadata?: Record<string, string>
  }
}

export interface CreateSupportTicketResponse {
  success: boolean
  data: SupportTicket
}

export interface ApiErrorResponse {
  success: false
  errors: string[]
  code?: string
}

export const supportTicketsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSupportTicket: builder.mutation<
      CreateSupportTicketResponse,
      CreateSupportTicketRequest
    >({
      query: (body) => ({
        url: '/api/v1/support_tickets',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useCreateSupportTicketMutation } = supportTicketsApi
