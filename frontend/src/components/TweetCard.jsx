import React, { useEffect, useState } from 'react'
import { useLikeTweetMutation, useUnlikeTweetMutation } from '../services/api'

export default function TweetCard({ tweet }) {
  const { id, author, content, createdAt, likesCount, imageUrl } = tweet
  const date = createdAt ? new Date(createdAt).toLocaleString() : ''

  const [localLiked, setLocalLiked] = useState(Boolean(tweet.likedByCurrentUser))
  const [localLikes, setLocalLikes] = useState(likesCount ?? 0)
  const [localError, setLocalError] = useState(null)

  const [likeTweet, { isLoading: liking }] = useLikeTweetMutation()
  const [unlikeTweet, { isLoading: unliking }] = useUnlikeTweetMutation()
  const loading = liking || unliking

  useEffect(() => {
    setLocalLiked(Boolean(tweet.likedByCurrentUser))
    setLocalLikes(likesCount ?? 0)
    setLocalError(null)
  }, [id, likesCount, tweet.likedByCurrentUser])

  const handleLike = async () => {
    if (loading) return
    setLocalError(null)
    setLocalLiked(true)
    setLocalLikes((n) => n + 1)
    try {
      await likeTweet(id).unwrap()
    } catch (err) {
      setLocalLiked(false)
      setLocalLikes((n) => Math.max(0, n - 1))
      setLocalError(err?.data?.message || 'Failed to like tweet')
    }
  }

  const handleUnlike = async () => {
    if (loading) return
    setLocalError(null)
    setLocalLiked(false)
    setLocalLikes((n) => Math.max(0, n - 1))
    try {
      await unlikeTweet(id).unwrap()
    } catch (err) {
      setLocalLiked(true)
      setLocalLikes((n) => n + 1)
      setLocalError(err?.data?.message || 'Failed to unlike tweet')
    }
  }

  return (
    <article className="bg-white border rounded p-4 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm font-semibold">@{author?.username}</div>
        <div className="text-xs text-gray-500 ml-2">{date}</div>
      </div>
      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{content}</p>
      {imageUrl && (
        <div className="mb-3">
          <img src={imageUrl} alt="tweet" className="w-full rounded" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Likes: {localLikes}</div>
        <div>
          {localLiked ? (
            <button onClick={handleUnlike} disabled={loading} className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50">
              {unliking ? '...' : 'Unlike'}
            </button>
          ) : (
            <button onClick={handleLike} disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50">
              {liking ? '...' : 'Like'}
            </button>
          )}
        </div>
      </div>
      {localError && <div className="text-red-600 mt-2">{localError}</div>}
    </article>
  )
}
