import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLikeTweetMutation, useUnlikeTweetMutation } from '../services/api'

export default function TweetCard({ tweet }) {
  const { id, author, content, createdAt, likesCount, imageUrl } = tweet
  const date = createdAt ? new Date(createdAt).toLocaleString() : ''

  const [localLiked, setLocalLiked] = useState(Boolean(tweet.likedByCurrentUser))
  const [localLikes, setLocalLikes] = useState(likesCount ?? 0)
  const [localReplies, setLocalReplies] = useState(Number(tweet.repliesCount ?? 0))
  const [localError, setLocalError] = useState(null)

  const [likeTweet, { isLoading: liking }] = useLikeTweetMutation()
  const [unlikeTweet, { isLoading: unliking }] = useUnlikeTweetMutation()
  const loading = liking || unliking

  useEffect(() => {
    setLocalLiked(Boolean(tweet.likedByCurrentUser))
    setLocalLikes(likesCount ?? 0)
    setLocalReplies(Number(tweet.repliesCount ?? 0))
    setLocalError(null)
  }, [id, likesCount, tweet.likedByCurrentUser, tweet.repliesCount])

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
    <article className="tweet-card">
      <div className="tweet-row">
        <div className="tweet-avatar">
          <div className="avatar-placeholder" style={{ width: 44, height: 44 }}>
            {author?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
        </div>

        <div className="tweet-body">
          <div className="tweet-author">
            <Link to={`/profile/${author?.username}`} className="name">{author?.displayName || author?.username}</Link>
            <span className="handle">· {date}</span>
          </div>

          <div className="tweet-content">{content}</div>

          {imageUrl && (
            <div className="mt-2">
              <img src={imageUrl} alt="tweet" className="w-full rounded" />
            </div>
          )}

          <div className="tweet-actions">
            {localLiked ? (
              <button aria-pressed="true" onClick={handleUnlike} disabled={loading} className="action-btn">
                <span className="like-badge">♥</span>
                <span className="muted">{localLikes}</span>
              </button>
            ) : (
              <button aria-pressed="false" onClick={handleLike} disabled={loading} className="action-btn">
                <span className="muted">♡</span>
                <span className="muted">{localLikes}</span>
              </button>
            )}

            <Link to={`/tweets/${id}`} className="action-btn muted">
              <span>Reply</span>
              <span className="muted">{localReplies ?? 0}</span>
            </Link>
          </div>
        </div>
      </div>

      {localError && <div className="text-red-500 mt-2">{localError}</div>}
    </article>
  )
}
