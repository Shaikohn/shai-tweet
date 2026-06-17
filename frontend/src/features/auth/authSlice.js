import { createSlice } from '@reduxjs/toolkit'

const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

const initialState = {
  token: token ?? null,
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token, user } = action.payload
      state.token = token
      state.user = user
    },
    setUser(state, action) {
      state.user = action.payload
    },
    logout(state) {
      state.token = null
      state.user = null
      if (typeof window !== 'undefined') localStorage.removeItem('token')
    },
  },
})

export const { setCredentials, setUser, logout } = authSlice.actions
export default authSlice.reducer
