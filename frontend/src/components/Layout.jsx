import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, setUser } from '../features/auth/authSlice'
import { useGetMeQuery } from '../services/api'

export default function Layout({ children }) {
  const user = useSelector((s) => s.auth.user)
  const token = useSelector((s) => s.auth.token)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { data: meData } = useGetMeQuery(undefined, { skip: !token })

  useEffect(() => {
    if (meData) {
      const u = meData.user ?? meData
      dispatch(setUser(u))
    }
  }, [meData, dispatch])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto flex items-center justify-between p-4">
          <Link to="/" className="text-xl font-bold">
            ShaiTweet
          </Link>
          <nav>
            {token ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">{user?.username}</span>
                <button onClick={handleLogout} className="text-sm text-red-600">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="text-sm text-green-600">
                  Register
                </Link>
              </div>
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
