import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'

export const subscriptionApi = createApi({
    reducerPath: 'subscriptionApi',
    tagTypes: ['Subscriptions'],
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://backend.ssinfrasoftware.com/api/v1',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    endpoints: (builder) => ({
        getAllSubscriptions: builder.query<any, any>({
            query: (params) => ({
                url: '/subscriptions',
                params,
            }),
            providesTags: ['Subscriptions'],
        }),
        getUserSubscriptions: builder.query<any, number>({
            query: (userId) => `/subscriptions/user/${userId}`,
            providesTags: ['Subscriptions'],
        }),
        assignPlan: builder.mutation<any, any>({
            query: (body) => ({
                url: '/subscriptions/assign',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Subscriptions'],
        }),
        cancelSubscription: builder.mutation<any, { id: number, softDelete?: boolean }>({
            query: ({ id, softDelete }) => ({
                url: `/subscriptions/${id}`,
                method: 'DELETE',
                params: { softDelete },
            }),
            invalidatesTags: ['Subscriptions'],
        }),
    }),
})

export const {
    useGetAllSubscriptionsQuery,
    useGetUserSubscriptionsQuery,
    useAssignPlanMutation,
    useCancelSubscriptionMutation
} = subscriptionApi
