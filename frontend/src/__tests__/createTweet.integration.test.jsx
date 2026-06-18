import React from 'react'
import { describe, it, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'

const mockCreate = vi.fn(() => ({ unwrap: async () => ({ tweet: { id: 't1', content: 'Hello from test' } }) }))
const feedResult = { data: { tweets: [], pagination: { page: 1, limit: 20, hasMore: false } }, isLoading: false, isError: false, error: null, refetch: () => {} }
const meResult = { data: { user: { id: 'u1', username: 'alice', displayName: 'Alice' } }, isError: false, error: null }

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useGetMeQuery: () => meResult,
    useGetFeedQuery: () => feedResult,
    useCreateTweetMutation: () => [mockCreate, { isLoading: false, error: null }],
  }
})

import AppRouter from '../routes/AppRouter'
import { renderWithProviders } from '../test-utils/renderWithProviders'

describe('Create tweet flow', () => {
  beforeEach(() => {
    // default fetch behavior
    global.fetch = vi.fn(async (input, init) => {
      const url = typeof input === 'string' ? input : input.url
      // me
      if (url.endsWith('/api/auth/me')) {
        return { ok: true, status: 200, json: async () => ({ user: { id: 'u1', username: 'alice', displayName: 'Alice' } }) }
      }
      // feed
      if (url.endsWith('/api/feed')) {
        return { ok: true, status: 200, json: async () => ({ tweets: [], pagination: { page: 1, limit: 20, hasMore: false } }) }
      }
      // create tweet
      if (url.endsWith('/api/tweets') && init?.method === 'POST') {
        const body = init.body ? JSON.parse(init.body) : {}
        return { ok: true, status: 201, json: async () => ({ tweet: { id: 't1', content: body.content, createdAt: new Date().toISOString(), user_id: 'u1' } }) }
      }
      return { ok: true, status: 200, json: async () => ({}) }
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('creates a tweet and clears the composer', async () => {
    const preloaded = { auth: { token: 'tok-123', user: { id: 'u1', username: 'alice', displayName: 'Alice' } } }
    const { store } = renderWithProviders(<AppRouter />, { route: '/', preloadedState: preloaded, withRouter: false })

    // Composer textarea
    const textarea = await screen.findByPlaceholderText("What's happening?")
    await userEvent.type(textarea, 'Hello from test')

    const tweetBtn = screen.getByRole('button', { name: /tweet/i })
    await userEvent.click(tweetBtn)

    // ensure createTweet hook was invoked
    await waitFor(() => expect(mockCreate).toHaveBeenCalled())

    // textarea should be cleared
    expect(textarea.value).toBe('')
  })
})
