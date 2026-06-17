import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useLoginMutation } from '../services/api'
import { setCredentials } from '../features/auth/authSlice'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [login, { isLoading, error }] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await login({ email, password }).unwrap()
      const { token, user } = res
      dispatch(setCredentials({ token, user }))
      localStorage.setItem('token', token)
      navigate('/')
    } catch (err) {
      // error handled by component state
    }
  }

  return (
    <div className="auth-page-center">
      <div className="auth-card">
        <div className="auth-brand">ShaiTweet</div>
        <div className="auth-sub">A focused, modern social timeline.</div>

        <div className="auth-title">Welcome back</div>
        <div className="auth-desc">Log in to continue your timeline.</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full input-dark" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full input-dark" />
          </div>

          <div className="form-actions">
            <button type="submit" className="w-full btn-primary btn-pill" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          {error && (
            <div className="text-red-600">
              {(() => {
                const e = error
                if (!e) return 'Login failed'
                if (e.data) {
                  if (typeof e.data === 'string') return e.data
                  if (e.data.message) return e.data.message
                  if (e.data.error) return e.data.error
                  if (Array.isArray(e.data.errors) && e.data.errors.length) return e.data.errors[0].msg || e.data.errors[0].message
                  return JSON.stringify(e.data)
                }
                return String(e.error || 'Login failed')
              })()}
            </div>
          )}

          <p className="mt-2 text-sm muted">
            Don't have an account? <Link to="/register" className="nav-link cursor-pointer">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
