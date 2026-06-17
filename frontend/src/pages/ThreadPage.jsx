import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetTweetRepliesQuery, useGetTweetByIdQuery } from '../services/api'
import ReplyComposer from '../components/ReplyComposer'
import TweetCard from '../components/TweetCard'

export default function ThreadPage() {
  const { id } = useParams()
  const LIMIT = 20
  const [page, setPage] = useState(1)
  const [replies, setReplies] = useState([])

  const { data, isLoading, isFetching, isError, error, refetch } = useGetTweetRepliesQuery({ id, page, limit: LIMIT })
  const { data: parentData, isLoading: parentLoading, isError: parentIsError, error: parentError, refetch: refetchParent } = useGetTweetByIdQuery(id)

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
    <div className="p-4 max-w-2xl mx-auto">
      <div className="page-header mb-4">
        <div>
          <h1 className="text-xl font-bold">Thread</h1>
          <div className="muted text-sm">Replies to the tweet</div>
        </div>
      </div>

      <div className="mb-4">
        {parentLoading && <div>Loading original tweet...</div>}
        {parentIsError && <div className="text-red-600">{parentError?.data?.message || 'Failed to load tweet'}</div>}
        {parentData && parentData.tweet && (
          <div className="mb-3">
            <div className="muted text-sm mb-2">Original tweet</div>
            <TweetCard tweet={parentData.tweet} />
          </div>
        )}

        <ReplyComposer tweetId={id} onCreated={async () => { setPage(1); await refetch(); if (refetchParent) await refetchParent(); }} />
      </div>

      {isLoading && page === 1 && <div>Loading replies...</div>}
      {isError && page === 1 && <div className="text-red-600">{error?.data?.message || 'Failed to load replies'}</div>}
      {!isLoading && !isError && replies.length === 0 && <div className="muted">No replies yet.</div>}

      <div className="tweet-list">
        {replies.map((r) => (
          <TweetCard key={r.id} tweet={r} />
        ))}
      </div>

      {data?.pagination?.hasMore && (
        <div className="text-center mt-4">
          <button onClick={handleLoadMore} disabled={isFetching} className="btn-primary">
            {isFetching ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
