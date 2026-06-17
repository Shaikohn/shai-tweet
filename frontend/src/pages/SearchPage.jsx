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
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search users</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by username or name" className="flex-1 border rounded p-2 mr-2" />
          <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Search</button>
        </div>
      </form>

      {!qParam && <div className="text-sm text-gray-600">Enter a query to search for users.</div>}

      {isLoading && <div>Searching...</div>}
      {isError && <div className="text-red-600">{error?.data?.message || 'Search failed'}</div>}

      {data && (
        <div className="space-y-3">
          {data.users.length === 0 && <div>No users found.</div>}
          {data.users.map((u) => (
            <div key={u.id} className="bg-white border rounded p-3 flex items-start">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">{u.avatarUrl ? <img src={u.avatarUrl} alt="avatar" className="w-full h-full rounded-full" /> : <span>{u.displayName?.[0] ?? u.username?.[0] ?? '?'}</span>}</div>
              <div className="flex-1">
                <div className="font-semibold">{u.displayName} <span className="text-sm text-gray-600">@{u.username}</span></div>
                <div className="text-sm text-gray-700">{u.bio}</div>
                <div className="mt-2">
                  <Link to={`/profile/${u.username}`} className="text-blue-600 text-sm">View profile</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
