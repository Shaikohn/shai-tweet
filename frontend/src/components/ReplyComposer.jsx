import React, { useState } from 'react'
import { useCreateReplyMutation } from '../services/api'

function getErrorMessage(err) {
  if (!err) return null
  const data = err.data
  if (data) {
    if (typeof data === 'string') return data
    if (data.message) return data.message
    if (data.error) return data.error
    if (Array.isArray(data.errors) && data.errors.length) return data.errors[0].msg || data.errors[0].message
    return JSON.stringify(data)
  }
  if (err.error) return String(err.error)
  return JSON.stringify(err)
}

export default function ReplyComposer({ tweetId, onCreated }) {
  const [content, setContent] = useState('')
  const [localError, setLocalError] = useState(null)
  const [createReply, { isLoading, error }] = useCreateReplyMutation()

  const trimmed = content.trim()
  const overLimit = content.length > 280
  const canSubmit = trimmed.length > 0 && !overLimit && !isLoading

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    if (trimmed.length === 0) {
      setLocalError('Reply cannot be empty')
      return
    }
    if (overLimit) {
      setLocalError('Reply cannot exceed 280 characters')
      return
    }
    try {
      await createReply({ id: tweetId, content: trimmed }).unwrap()
      setContent('')
      if (onCreated) onCreated()
    } catch (err) {
      setLocalError(getErrorMessage(err) || 'Failed to create reply')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="composer">
      <div className="composer-body">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a reply"
          rows={3}
          className="composer-textarea"
        />

        <div className="composer-footer">
          <div className="composer-counter">{content.length}/280</div>
          <div>
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Replying...' : 'Reply'}
            </button>
          </div>
        </div>

        {localError && <div className="text-red-500 mt-2">{localError}</div>}
        {!localError && error && <div className="text-red-500 mt-2">{getErrorMessage(error) || 'Failed to create reply'}</div>}
      </div>
    </form>
  )
}
