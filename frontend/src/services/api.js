import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const rawBase = import.meta.env.VITE_API_URL || ''
const baseUrl = rawBase.replace(/\/$/, '')
const apiPrefix = baseUrl.endsWith('/api') ? '' : '/api'

const baseQuery = fetchBaseQuery({
	baseUrl,
	prepareHeaders: (headers, { getState }) => {
		const tokenFromState = getState()?.auth?.token
		const token = tokenFromState ?? (typeof window !== 'undefined' && localStorage.getItem('token'))
		if (token) headers.set('Authorization', `Bearer ${token}`)
		return headers
	},
})

export const api = createApi({
	reducerPath: 'api',
	baseQuery,
	endpoints: (builder) => ({
		login: builder.mutation({
			query: (credentials) => ({
				url: `${apiPrefix}/auth/login`,
				method: 'POST',
				body: credentials,
			}),
		}),
		register: builder.mutation({
			query: (data) => ({
				url: `${apiPrefix}/auth/register`,
				method: 'POST',
				body: data,
			}),
		}),
		getMe: builder.query({
			query: () => ({
				url: `${apiPrefix}/auth/me`,
				method: 'GET',
			}),
		}),
		getFeed: builder.query({
			query: ({ page = 1, limit = 20 } = {}) => ({
				url: `${apiPrefix}/feed?page=${page}&limit=${limit}`,
				method: 'GET',
			}),
		}),
		createTweet: builder.mutation({
			query: ({ content }) => ({
				url: `${apiPrefix}/tweets`,
				method: 'POST',
				body: { content },
			}),
		}),
		getUserProfile: builder.query({
			query: (username) => ({
				url: `${apiPrefix}/users/${username}`,
				method: 'GET',
			}),
		}),
		getTweetReplies: builder.query({
			query: ({ id, page = 1, limit = 20 } = {}) => ({
				url: `${apiPrefix}/tweets/${id}/replies?page=${page}&limit=${limit}`,
				method: 'GET',
			}),
		}),
		getUserTweets: builder.query({
			query: ({ username, page = 1, limit = 20 } = {}) => ({
				url: `${apiPrefix}/users/${username}/tweets?page=${page}&limit=${limit}`,
				method: 'GET',
			}),
		}),
		searchUsers: builder.query({
			query: (q) => ({
				url: `${apiPrefix}/users/search?q=${encodeURIComponent(q ?? '')}`,
				method: 'GET',
			}),
		}),
		followUser: builder.mutation({
			query: (username) => ({
				url: `${apiPrefix}/users/${username}/follow`,
				method: 'POST',
			}),
		}),
		unfollowUser: builder.mutation({
			query: (username) => ({
				url: `${apiPrefix}/users/${username}/follow`,
				method: 'DELETE',
			}),
		}),
		createReply: builder.mutation({
			query: ({ id, content }) => ({
				url: `${apiPrefix}/tweets/${id}/replies`,
				method: 'POST',
				body: { content },
			}),
		}),
		likeTweet: builder.mutation({
			query: (id) => ({
				url: `${apiPrefix}/tweets/${id}/like`,
				method: 'POST',
			}),
		}),
		unlikeTweet: builder.mutation({
			query: (id) => ({
				url: `${apiPrefix}/tweets/${id}/like`,
				method: 'DELETE',
			}),
		}),
	}),
})

export const {
	useLoginMutation,
	useRegisterMutation,
	useGetMeQuery,
	useGetFeedQuery,
	useCreateTweetMutation,
	useLikeTweetMutation,
	useUnlikeTweetMutation,
	useGetUserProfileQuery,
	useGetUserTweetsQuery,
	useGetTweetRepliesQuery,
	useSearchUsersQuery,
	useFollowUserMutation,
	useUnfollowUserMutation,
    useCreateReplyMutation,
} = api

