import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'

export const plansApi = createApi({
    reducerPath: 'plansApi',
    tagTypes: ['Plans'],
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
        getPlans: builder.query<any, any>({
            query: (params) => ({
                url: '/plans',
                params,
            }),
            providesTags: ['Plans'],
        }),
        getPlan: builder.query<any, number>({
            query: (id) => `/plans/${id}`,
            providesTags: (result, error, id) => [{ type: 'Plans', id }],
        }),
        createPlan: builder.mutation<any, any>({
            query: (body) => ({
                url: '/plans',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Plans'],
        }),
        updatePlan: builder.mutation<any, { id: number, data: any }>({
            query: ({ id, data }) => ({
                url: `/plans/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => ['Plans', { type: 'Plans', id }],
        }),
        deletePlan: builder.mutation<any, number>({
            query: (id) => ({
                url: `/plans/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Plans'],
        }),
    }),
})

export const {
    useGetPlansQuery,
    useGetPlanQuery,
    useCreatePlanMutation,
    useUpdatePlanMutation,
    useDeletePlanMutation
} = plansApi
