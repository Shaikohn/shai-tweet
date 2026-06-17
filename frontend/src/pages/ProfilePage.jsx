import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetUserProfileQuery, useGetUserTweetsQuery } from '../services/api'
import TweetCard from '../components/TweetCard'

const getErrorMessage = (err) => {
  if (!err) return null
  const data = err.data
  if (data) {
    if (typeof data === 'string') return data
    if (data.message) return data.message
    return JSON.stringify(data)
  }
  return err?.error || JSON.stringify(err)
}

export default function ProfilePage() {
  const { username } = useParams()
  const LIMIT = 20
  const [page, setPage] = useState(1)
  const [tweets, setTweets] = useState([])

  const { data: profileData, isLoading: loadingProfile, isError: profileError, error: profileErr } = useGetUserProfileQuery(username)
  const { data, isLoading, isFetching, isError, error, refetch } = useGetUserTweetsQuery({ username, page, limit: LIMIT })

  useEffect(() => {
    setTweets([])
    setPage(1)
  }, [username])

  useEffect(() => {
    if (!data) return
    const newTweets = data.tweets || []
    setTweets((prev) => {
      if (page === 1) return newTweets
      const existing = new Set(prev.map((t) => t.id))
      const additions = newTweets.filter((t) => !existing.has(t.id))
      return [...prev, ...additions]
    })
  }, [data, page])

  const handleLoadMore = () => setPage((p) => p + 1)

  if (loadingProfile) return <div className="p-4">Loading profile...</div>
  if (profileError) {
    if (profileErr?.status === 404) return <div className="p-4">User not found</div>
    return <div className="p-4 text-red-600">{getErrorMessage(profileErr) || 'Failed to load profile'}</div>
  }

  const user = profileData?.user

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="bg-white border rounded p-4 mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">{user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full rounded-full" /> : <span className="text-xl">{user?.displayName?.[0] ?? user?.username?.[0] ?? '?'}</span>}</div>
          <div>
            <div className="text-xl font-bold">{user?.displayName}</div>
            <div className="text-sm text-gray-600">@{user?.username}</div>
            <div className="mt-2 text-sm">{user?.bio}</div>
            <div className="mt-3 text-sm text-gray-600">{user?.tweetsCount} Tweets • {user?.followersCount} Followers • {user?.followingCount} Following</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Tweets</h2>

        {isLoading && page === 1 && <div>Loading tweets...</div>}
        {isError && page === 1 && <div className="text-red-600">{getErrorMessage(error) || 'Failed to load tweets'}</div>}
        {!isLoading && !isError && tweets.length === 0 && <div>No tweets yet.</div>}

        <div>
          {tweets.map((t) => (
            <TweetCard key={t.id} tweet={t} />
          ))}
        </div>

        {data?.pagination?.hasMore && (
          <div className="text-center mt-4">
            <button onClick={handleLoadMore} disabled={isFetching} className="px-4 py-2 bg-blue-600 text-white rounded">
              {isFetching ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
