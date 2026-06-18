import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { api } from '../services/api'
import authReducer from '../features/auth/authSlice'

export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
    preloadedState,
  })
}

export function renderWithProviders(ui, { route = '/', preloadedState = {}, store = null, withRouter = true } = {}) {
  const usedStore = store ?? createTestStore(preloadedState)
  // When tests render AppRouter which includes a BrowserRouter internally,
  // callers pass `withRouter: false`. In that case set window history to
  // the requested route so BrowserRouter picks up the correct initial URL.
  if (!withRouter && typeof window !== 'undefined' && route) {
    window.history.pushState({}, '', route)
  }
  const Wrapper = ({ children }) => (
    <Provider store={usedStore}>
      {withRouter ? <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter> : children}
    </Provider>
  )

  return { store: usedStore, ...render(ui, { wrapper: Wrapper }) }
}
