import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetUserProfileQuery, useGetUserTweetsQuery, useFollowUserMutation, useUnfollowUserMutation } from '../services/api'
import { useSelector } from 'react-redux'
import TweetCard from '../components/TweetCard'

export default function ProfilePage() {
  const { username } = useParams()
  const currentUser = useSelector((s) => s.auth.user)
  const currentUsername = currentUser?.username

  const { data: profileData, isLoading: loadingProfile, error: profileError } = useGetUserProfileQuery(username)

  const [page, setPage] = useState(1)
  const [tweets, setTweets] = useState([])
  const { data: tweetsData, isLoading: loadingTweets, isFetching, error: tweetsError } = useGetUserTweetsQuery({ username, page }, { skip: !username })

  const [followUser, { isLoading: followLoading }] = useFollowUserMutation()
  const [unfollowUser, { isLoading: unfollowLoading }] = useUnfollowUserMutation()

  const [isFollowing, setIsFollowing] = useState(false)
  const [localFollowersCount, setLocalFollowersCount] = useState(0)
  const [followError, setFollowError] = useState(null)

  useEffect(() => {
    setTweets([])
    setPage(1)
    setFollowError(null)
  }, [username])

  useEffect(() => {
    if (!tweetsData) return
    const newTweets = tweetsData.tweets || []
    setTweets((prev) => {
      if (page === 1) return newTweets
      const existing = new Set(prev.map((t) => t.id))
      const additions = newTweets.filter((t) => !existing.has(t.id))
      return [...prev, ...additions]
    })
  }, [tweetsData, page])

  useEffect(() => {
    setLocalFollowersCount(profileData?.user?.followersCount ?? 0)
    setIsFollowing(Boolean(profileData?.user?.followedByCurrentUser ?? false))
  }, [profileData])

  const handleLoadMore = () => setPage((p) => p + 1)

  const handleFollowToggle = async () => {
    setFollowError(null)
    try {
      if (isFollowing) {
        setIsFollowing(false)
        setLocalFollowersCount((n) => Math.max(0, n - 1))
        await unfollowUser(username).unwrap()
      } else {
        setIsFollowing(true)
        setLocalFollowersCount((n) => n + 1)
        await followUser(username).unwrap()
      }
    } catch (err) {
      setFollowError(err?.data?.message || 'Follow action failed')
      // revert optimistic
      setIsFollowing((v) => !v)
      setLocalFollowersCount(profileData?.user?.followersCount ?? 0)
    }
  }

  if (loadingProfile) return <div className="p-4">Loading profile...</div>
  if (profileError) {
    if (profileError?.status === 404) return <div className="p-4">User not found</div>
    return <div className="p-4 text-red-600">{profileError?.data?.message || 'Failed to load profile'}</div>
  }

  const user = profileData?.user

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="profile-hero">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start gap-4">
            <div className="avatar-placeholder" style={{ width: 72, height: 72 }}>
              {user?.displayName?.[0] ?? user?.username?.[0] ?? '?'}
            </div>
            <div>
              <div className="text-2xl font-bold">{user?.displayName}</div>
              <div className="muted">@{user?.username}</div>
              <div className="mt-2 muted">{user?.bio}</div>

              <div className="profile-stats mt-3">
                <div>
                  <div className="font-semibold">{user?.tweetsCount}</div>
                  <div className="muted text-sm">Tweets</div>
                </div>
                <div>
                  <div className="font-semibold">{localFollowersCount}</div>
                  <div className="muted text-sm">Followers</div>
                </div>
                <div>
                  <div className="font-semibold">{user?.followingCount}</div>
                  <div className="muted text-sm">Following</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            {currentUsername !== user?.username && (
              <div>
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading || unfollowLoading}
                  className={isFollowing ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
                >
                  {followLoading || unfollowLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                {followError && <div className="text-red-500 mt-2">{followError}</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2 mt-4">Tweets</h2>

        {loadingTweets && page === 1 && <div>Loading tweets...</div>}
        {tweetsError && page === 1 && <div className="text-red-600">{tweetsError?.data?.message || 'Failed to load tweets'}</div>}
        {!loadingTweets && !tweetsError && tweets.length === 0 && <div>No tweets yet.</div>}

        <div className="tweet-list">
          {tweets.map((t) => (
            <TweetCard key={t.id} tweet={t} />
          ))}
        </div>

        {tweetsData?.pagination?.hasMore && (
          <div className="text-center mt-4">
            <button onClick={handleLoadMore} disabled={isFetching} className="btn-primary">
              {isFetching ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
