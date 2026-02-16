import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'

export const dashboardApi = createApi({
    reducerPath: 'dashboardApi',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/v1',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    endpoints: (builder) => ({
        getDashboardStats: builder.query<any, void>({
            query: () => '/admin/dashboard',
        }),
        getRechargeReports: builder.query<any, any>({
            query: (params) => ({
                url: '/admin/recharge-reports',
                params,
            }),
        }),
        getUsersList: builder.query<any, any>({
            query: (params) => ({
                url: '/admin/users',
                params,
            }),
        }),
    }),
})

export const { useGetDashboardStatsQuery, useGetRechargeReportsQuery, useGetUsersListQuery } = dashboardApi
