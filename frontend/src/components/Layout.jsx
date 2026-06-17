import React from 'react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  )
}
