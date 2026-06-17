import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetTweetRepliesQuery } from '../services/api'
import ReplyComposer from '../components/ReplyComposer'
import TweetCard from '../components/TweetCard'

export default function ThreadPage() {
  const { id } = useParams()
  const LIMIT = 20
  const [page, setPage] = useState(1)
  const [replies, setReplies] = useState([])

  const { data, isLoading, isFetching, isError, error, refetch } = useGetTweetRepliesQuery({ id, page, limit: LIMIT })

  useEffect(() => {
    setReplies([])
    setPage(1)
  }, [id])

  useEffect(() => {
    if (!data) return
    const newReplies = data.tweets || []
    setReplies((prev) => {
      if (page === 1) return newReplies
      const existing = new Set(prev.map((t) => t.id))
      const additions = newReplies.filter((t) => !existing.has(t.id))
      return [...prev, ...additions]
    })
  }, [data, page])

  const handleLoadMore = () => setPage((p) => p + 1)

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Replies</h1>

      <ReplyComposer tweetId={id} onCreated={async () => { setPage(1); await refetch() }} />

      {isLoading && page === 1 && <div>Loading replies...</div>}
      {isError && page === 1 && <div className="text-red-600">{error?.data?.message || 'Failed to load replies'}</div>}
      {!isLoading && !isError && replies.length === 0 && <div>No replies yet.</div>}

      <div>
        {replies.map((r) => (
          <TweetCard key={r.id} tweet={r} />
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
  )
}
