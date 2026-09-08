import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProfileReviewsList } from './ProfileReviewsList'

vi.mock('@/services/api/reviewsApi', () => ({
  useGetReviewsQuery: () => ({
    data: {
      data: [
        { id: 1, rating: 5, comment: 'Good', reviewer: { name: 'Alice', photo_url: '/alice.jpg' } },
        {
          id: 2,
          rating: 4,
          comment: 'Anonymous',
          anonymous: true,
          reviewer: { name: 'Bob', photo_url: '/bob.jpg' },
        },
      ],
    },
  }),
}))

describe('review photos', () => {
  it('renders the current API photo_url without exposing anonymous reviewer photos', () => {
    render(<ProfileReviewsList userId={1} />)
    expect(screen.getByRole('img', { name: 'Alice' })).toHaveAttribute('src', '/alice.jpg')
    expect(screen.queryByRole('img', { name: 'Bob' })).not.toBeInTheDocument()
  })
})
