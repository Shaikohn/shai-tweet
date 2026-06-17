import React, { useEffect, useState } from 'react'
import TweetCard from '../components/TweetCard'
import TweetComposer from '../components/TweetComposer'
import { useGetFeedQuery } from '../services/api'

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

export default function FeedPage() {
  const LIMIT = 20
  const [page, setPage] = useState(1)
  const [tweets, setTweets] = useState([])

  const { data, isLoading, isFetching, isError, error, refetch } = useGetFeedQuery({ page, limit: LIMIT })

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

  const handleCreated = () => {
    if (page === 1) {
      refetch()
    } else {
      setPage(1)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="page-header mb-4">
        <div>
          <h1 className="text-2xl font-bold">Feed</h1>
          <div className="muted text-sm">Latest from people you follow</div>
        </div>
      </div>

      <div className="composer-block">
        <TweetComposer onCreated={handleCreated} />
      </div>

      {isLoading && page === 1 && <div className="p-3">Loading feed...</div>}

      {isError && page === 1 && (
        <div className="p-3 text-red-600">{getErrorMessage(error) || 'Failed to load feed'}</div>
      )}

      {!isLoading && !isError && tweets.length === 0 && (
        <div className="p-3 muted">Your timeline is empty. Search for users and start following people to build your feed.</div>
      )}

      <div className="tweet-list mt-3">
        {tweets.map((t) => (
          <TweetCard key={t.id} tweet={t} />
        ))}
      </div>

      {data?.pagination?.hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={isFetching}
            className="btn-primary"
          >
            {isFetching ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
