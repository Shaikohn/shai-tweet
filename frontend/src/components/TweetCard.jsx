import React from 'react'

export default function TweetCard({ tweet }) {
  const { author, content, createdAt, likesCount, imageUrl } = tweet
  const date = createdAt ? new Date(createdAt).toLocaleString() : ''

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
      <div className="text-sm text-gray-600">Likes: {likesCount ?? 0}</div>
    </article>
  )
}
