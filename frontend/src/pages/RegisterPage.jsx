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
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Display name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
        {error && <div className="text-red-600">{getErrorMessage(error) || 'Registration failed'}</div>}
      </form>
      <p className="mt-4 text-sm">
        Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
      </p>
    </div>
  )
}
