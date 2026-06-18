import React from 'react'
import { describe, it, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'

const mockFollow = vi.fn(() => ({ unwrap: async () => ({}) }))
const mockUnfollow = vi.fn(() => ({ unwrap: async () => ({}) }))
const profileResult = { data: { user: { id: 'other-id', username: 'other', displayName: 'Other', followersCount: 5, followingCount: 0, tweetsCount: 0, followedByCurrentUser: false } }, isLoading: false, isError: false }
const tweetsResult = { data: { tweets: [], pagination: { page: 1, limit: 20, hasMore: false } }, isLoading: false, isError: false }
const feedResult = { data: { tweets: [], pagination: { page: 1, limit: 20, hasMore: false } }, isLoading: false, isError: false, error: null, refetch: () => {} }

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useGetMeQuery: () => ({ data: undefined, isError: false, error: null }),
    useGetUserProfileQuery: () => profileResult,
    useGetUserTweetsQuery: () => tweetsResult,
    useGetFeedQuery: () => feedResult,
    useFollowUserMutation: () => [mockFollow, { isLoading: false }],
    useUnfollowUserMutation: () => [mockUnfollow, { isLoading: false }],
  }
})

import AppRouter from '../routes/AppRouter'
import { renderWithProviders } from '../test-utils/renderWithProviders'

describe('Follow flow', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async (input, init) => {
      const url = typeof input === 'string' ? input : input.url
      // me
      if (url.endsWith('/api/auth/me')) {
        return { ok: true, status: 200, json: async () => ({ user: { id: 'me', username: 'me', displayName: 'Me' } }) }
      }
      // profile
      if (url.match(/\/api\/users\/other($|\/)/)) {
        if (url.endsWith('/tweets')) {
          return { ok: true, status: 200, json: async () => ({ tweets: [], pagination: { page: 1, limit: 20, hasMore: false } }) }
        }
        return { ok: true, status: 200, json: async () => ({ user: { id: 'other-id', username: 'other', displayName: 'Other', followersCount: 5, followingCount: 0, tweetsCount: 0, followedByCurrentUser: false } }) }
      }
      // follow
      if (url.endsWith('/api/users/other/follow') && init?.method === 'POST') {
        return { ok: true, status: 200, json: async () => ({}) }
      }
      return { ok: true, status: 200, json: async () => ({}) }
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('follows a user and updates the button', async () => {
    const preloaded = { auth: { token: 'tok-123', user: { id: 'me', username: 'me', displayName: 'Me' } } }
    renderWithProviders(<AppRouter />, { route: '/profile/other', preloadedState: preloaded, withRouter: false })

    // wait for profile to load
    expect(await screen.findByText('Other')).toBeTruthy()

    const followBtn = screen.getByRole('button', { name: /follow/i })
    await userEvent.click(followBtn)

    // ensure follow hook was invoked
    await waitFor(() => expect(mockFollow).toHaveBeenCalled())

    // optimistic UI should flip to Unfollow
    expect(screen.getByRole('button', { name: /unfollow/i })).toBeTruthy()
  })
})
