import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'

export const commissionApi = createApi({
    reducerPath: 'commissionApi',
    tagTypes: ['CommissionConfigs'],
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
        getCommissionConfigs: builder.query<{ success: boolean; configs: { level: number; percentage: string; is_active: boolean }[] }, void>({
            query: () => '/commission-configs',
            providesTags: ['CommissionConfigs'],
        }),
        updateCommissionConfigs: builder.mutation<{ success: boolean }, { configs: { level: number; percentage: number; isActive: boolean }[] }>({
            query: (body) => ({
                url: '/commission-configs',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['CommissionConfigs'],
        }),
    }),
})

export const { useGetCommissionConfigsQuery, useUpdateCommissionConfigsMutation } = commissionApi
