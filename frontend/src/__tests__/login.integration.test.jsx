import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'

// Mock the api module before importing app/router or test utils (they import api for store)
const mockLogin = vi.fn(() => ({ unwrap: async () => ({ token: 'tok-123', user: { id: 'u1', username: 'alice', displayName: 'Alice' } }) }))
const feedResult = { data: { tweets: [], pagination: { page: 1, limit: 20, hasMore: false } }, isLoading: false, isError: false, error: null, refetch: () => {} }
const meResult = { data: { user: { id: 'u1', username: 'alice', displayName: 'Alice' } }, isError: false, error: null }

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useLoginMutation: () => [mockLogin, { isLoading: false, error: null }],
    useGetMeQuery: () => meResult,
    useGetFeedQuery: () => feedResult,
  }
})

import AppRouter from '../routes/AppRouter'
import { renderWithProviders } from '../test-utils/renderWithProviders'

describe('Login flow', () => {
  beforeEach(() => {
    // reset fetch mock
    global.fetch = vi.fn(async (input, init) => {
      const url = typeof input === 'string' ? input : input.url
      // login
      if (url.endsWith('/api/auth/login') && init?.method === 'POST') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ token: 'tok-123', user: { id: 'u1', username: 'alice', displayName: 'Alice' } }),
        }
      }
      // me
      if (url.endsWith('/api/auth/me')) {
        return { ok: true, status: 200, json: async () => ({ user: { id: 'u1', username: 'alice', displayName: 'Alice' } }) }
      }
      // feed
      if (url.endsWith('/api/feed')) {
        return { ok: true, status: 200, json: async () => ({ tweets: [], pagination: { page: 1, limit: 20, hasMore: false } }) }
      }
      return { ok: true, status: 200, json: async () => ({}) }
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
  })

  it('logs in and navigates to feed', async () => {
    const { store } = renderWithProviders(<AppRouter />, { route: '/login', withRouter: false })

    // find labels then their inputs
    const emailLabel = screen.getByText('Email')
    const emailInput = emailLabel.parentElement.querySelector('input')
    const passwordLabel = screen.getByText('Password')
    const passwordInput = passwordLabel.parentElement.querySelector('input')

    await userEvent.type(emailInput, 'alice@example.com')
    await userEvent.type(passwordInput, 'Password123!')

    const loginBtn = screen.getByRole('button', { name: /login/i })
    await userEvent.click(loginBtn)

    // wait for navigation to feed (page heading)
    await waitFor(() => expect(screen.getByRole('heading', { name: /Feed/i })).toBeInTheDocument())

    // auth token saved in store and localStorage
    expect(store.getState().auth.token).toBe('tok-123')
    expect(localStorage.getItem('token')).toBe('tok-123')
  })
})
