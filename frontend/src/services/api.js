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
	}),
})

export const { useLoginMutation, useRegisterMutation, useGetMeQuery, useGetFeedQuery, useCreateTweetMutation } = api

