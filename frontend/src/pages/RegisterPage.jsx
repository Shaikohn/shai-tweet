import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '../services/api'

const getErrorMessage = (err) => {
  if (!err) return null
  const data = err.data
  if (data) {
    if (typeof data === 'string') return data
    if (data.message) return data.message
    if (data.error) return data.error
    if (Array.isArray(data.errors) && data.errors.length) {
      const first = data.errors[0]
      return first.msg || first.message || JSON.stringify(first)
    }
    return JSON.stringify(data)
  }
  if (err.error) return String(err.error)
  return JSON.stringify(err)
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [register, { isLoading, error }] = useRegisterMutation()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register({ email, password, username, displayName }).unwrap()
      navigate('/login')
    } catch (err) {
      // handled by component state
    }
  }

  return (
    <div className="auth-page-center">
      <div className="auth-card">
        <div className="auth-brand">ShaiTweet</div>
        <div className="auth-sub">A focused, modern social timeline.</div>

        <div className="auth-title">Create your account</div>
        <div className="auth-desc">Join ShaiTweet and start building your timeline.</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full input-dark" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full input-dark" />
          </div>
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full input-dark" />
          </div>
          <div>
            <label className="block text-sm font-medium">Display name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 block w-full input-dark" />
          </div>

          <div className="form-actions">
            <button type="submit" className="w-full btn-primary btn-pill" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>

          {error && <div className="text-red-600">{getErrorMessage(error) || 'Registration failed'}</div>}

          <p className="mt-2 text-sm muted">
            Already have an account? <Link to="/login" className="nav-link cursor-pointer">Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
