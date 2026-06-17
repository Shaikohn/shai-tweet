import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSearchUsersQuery } from '../services/api'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const qParam = searchParams.get('q') || ''
  const [query, setQuery] = useState(qParam)

  useEffect(() => setQuery(qParam), [qParam])

  const { data, isLoading, isError, error } = useSearchUsersQuery(qParam, { skip: !qParam })

  const handleSubmit = (e) => {
    e.preventDefault()
    const v = query.trim()
    if (v) setSearchParams({ q: v })
    else setSearchParams({})
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search users</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by username or name" className="flex-1 input-dark mr-2" />
          <button type="submit" className="btn-primary btn-pill">Search</button>
        </div>
      </form>

      {!qParam && <div className="text-sm muted">Enter a query to search for users.</div>}

      {isLoading && <div>Searching...</div>}
      {isError && <div className="text-red-600">{error?.data?.message || 'Search failed'}</div>}

      {data && (
        <div className="space-y-3">
          {data.users.length === 0 && <div>No users found.</div>}
          {data.users.map((u) => (
            <div key={u.id} className="search-result">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                {u.avatarUrl ? <img src={u.avatarUrl} alt="avatar" className="w-full h-full rounded-full" /> : <div className="avatar-placeholder" style={{ width: 48, height: 48 }}>{u.displayName?.[0] ?? u.username?.[0] ?? '?'}</div>}
              </div>

              <div className="flex-1">
                <div className="font-semibold">{u.displayName} <span className="text-sm muted">@{u.username}</span></div>
                <div className="bio mt-1">{u.bio}</div>
              </div>

              <div className="result-action">
                <Link to={`/profile/${u.username}`} className="btn-secondary btn-sm">View profile</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
