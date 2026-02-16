import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'

export const usersApi = createApi({
    reducerPath: 'usersApi',
    tagTypes: ['Owners', 'Operators'],
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
        getOwners: builder.query<any, any>({
            query: (params) => ({
                url: '/admin/owners',
                params,
            }),
            providesTags: ['Owners'],
        }),
        getOwnerDetails: builder.query<any, string>({
            query: (id) => `/admin/owners/${id}`,
            providesTags: (result, error, id) => [{ type: 'Owners', id }],
        }),
        createOwner: builder.mutation<any, any>({
            query: (body) => ({
                url: '/auth/register/owner',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Owners'],
        }),
        updateOwner: builder.mutation<any, { id: number, data: any }>({
            query: ({ id, data }) => ({
                url: `/admin/owners/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => ['Owners', { type: 'Owners', id }],
        }),
        deleteOwner: builder.mutation<any, number>({
            query: (id) => ({
                url: `/admin/owners/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Owners'],
        }),
        getOperators: builder.query<any, any>({
            query: (params) => ({
                url: '/admin/operators',
                params,
            }),
            providesTags: ['Operators'],
        }),
        getOperatorDetails: builder.query<any, string>({
            query: (id) => `/admin/operators/${id}`,
            providesTags: (result, error, id) => [{ type: 'Operators', id }],
        }),
        createOperator: builder.mutation<any, any>({
            query: (body) => ({
                url: '/auth/register/operator',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Operators'],
        }),
        updateOperator: builder.mutation<any, { id: number, data: any }>({
            query: ({ id, data }) => ({
                url: `/admin/operators/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => ['Operators', { type: 'Operators', id }],
        }),
        deleteOperator: builder.mutation<any, number>({
            query: (id) => ({
                url: `/admin/operators/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Operators'],
        }),
    }),
})

export const {
    useGetOwnersQuery,
    useGetOwnerDetailsQuery,
    useCreateOwnerMutation,
    useUpdateOwnerMutation,
    useDeleteOwnerMutation,
    useGetOperatorsQuery,
    useGetOperatorDetailsQuery,
    useCreateOperatorMutation,
    useUpdateOperatorMutation,
    useDeleteOperatorMutation
} = usersApi
