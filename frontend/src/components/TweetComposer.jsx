import React, { useState } from 'react'
import { useCreateTweetMutation } from '../services/api'

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

export default function TweetComposer({ onCreated }) {
  const [content, setContent] = useState('')
  const [localError, setLocalError] = useState(null)
  const [createTweet, { isLoading, error }] = useCreateTweetMutation()

  const trimmed = content.trim()
  const overLimit = content.length > 280
  const canSubmit = trimmed.length > 0 && !overLimit && !isLoading

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    if (trimmed.length === 0) {
      setLocalError('Tweet cannot be empty')
      return
    }
    if (overLimit) {
      setLocalError('Tweet cannot exceed 280 characters')
      return
    }
    try {
      await createTweet({ content: trimmed }).unwrap()
      setContent('')
      if (onCreated) onCreated()
    } catch (err) {
      setLocalError(getErrorMessage(err) || 'Failed to create tweet')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded mb-4 border">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        rows={4}
        className="w-full border rounded p-2"
      />
      <div className="flex items-center justify-between mt-2">
        <div className="text-sm text-gray-600">{content.length}/280</div>
        <div className="flex items-center space-x-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isLoading ? 'Posting...' : 'Tweet'}
          </button>
        </div>
      </div>
      {localError && <div className="text-red-600 mt-2">{localError}</div>}
      {!localError && error && <div className="text-red-600 mt-2">{getErrorMessage(error) || 'Failed to create tweet'}</div>}
    </form>
  )
}
