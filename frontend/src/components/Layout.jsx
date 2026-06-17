import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, setUser } from '../features/auth/authSlice'
import { useGetMeQuery, api } from '../services/api'

/* Layout: dark themed header with global search input. */

export default function Layout({ children }) {
  const user = useSelector((s) => s.auth.user)
  const token = useSelector((s) => s.auth.token)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { data: meData, error: meError, isError: meIsError } = useGetMeQuery(undefined, { skip: !token })
  const [navQuery, setNavQuery] = useState('')

  useEffect(() => {
    if (meData) {
      const u = meData.user ?? meData
      dispatch(setUser(u))
    }
  }, [meData, dispatch])

  useEffect(() => {
    if (!token) return
    if (!meIsError) return
    const status = meError?.status ?? meError?.originalStatus
    if (status === 401) {
      dispatch(logout())
      dispatch(api.util.resetApiState())
      navigate('/login')
    }
  }, [meIsError, meError, token, dispatch, navigate])

  const handleLogout = () => {
    dispatch(logout());
    dispatch(api.util.resetApiState());
    navigate('/login');
  }

  const handleNavSearch = (e) => {
    e.preventDefault()
    const v = navQuery.trim()
    if (v) navigate(`/search?q=${encodeURIComponent(v)}`)
    else navigate('/search')
    setNavQuery('')
  }

  return (
    <div className="min-h-screen app-bg">
      <header className="app-header">
        <div className="max-w-3xl mx-auto p-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-auto flex items-center justify-between">
            <Link to="/" className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              ShaiTweet
            </Link>
            <button className="md:hidden btn-secondary" onClick={() => navigate('/search')}>Search</button>
          </div>

          <form onSubmit={handleNavSearch} className="w-full md:w-1/2 mt-3 md:mt-0 md:mx-4">
            <input
              className="w-full input-dark"
              placeholder="Search users"
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
            />
          </form>

          <nav className="w-full md:w-auto mt-3 md:mt-0 flex items-center justify-end space-x-4">
            {token ? (
              <>
                <Link to="/" className="nav-link">Feed</Link>
                <Link to={user ? `/profile/${user.username}` : '/profile'} className="nav-link">My Profile</Link>
                <button onClick={handleLogout} className="text-sm text-red-400 cursor-pointer">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <div className="max-w-3xl mx-auto p-4">{children}</div>
      </main>
    </div>
  )
}
