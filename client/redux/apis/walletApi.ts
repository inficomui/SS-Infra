import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'

export interface BankDetails {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    holderName: string;
}

export interface User {
    id: number;
    name: string;
    mobile: string;
}

export interface WithdrawalRequest {
    id: number;
    user: User;
    amount: string;
    status: 'pending' | 'approved' | 'rejected';
    bankDetails: BankDetails;
    adminNote?: string;
    createdAt: string;
}

export interface WithdrawalResponse {
    success: boolean;
    withdrawals: WithdrawalRequest[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const walletApi = createApi({
    reducerPath: 'walletApi',
    tagTypes: ['Withdrawals'],
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
        getWithdrawalRequests: builder.query<WithdrawalResponse, { page?: number; limit?: number; status?: string }>({
            query: (params) => ({
                url: '/admin/wallet/withdrawals',
                params,
            }),
            providesTags: ['Withdrawals'],
        }),
        approveWithdrawal: builder.mutation<{ success: boolean; message: string }, { id: number; note?: string }>({
            query: ({ id, note }) => ({
                url: `/admin/wallet/withdrawals/${id}/approve`,
                method: 'POST',
                body: { note },
            }),
            invalidatesTags: ['Withdrawals'],
        }),
        rejectWithdrawal: builder.mutation<{ success: boolean; message: string }, { id: number; note: string }>({
            query: ({ id, note }) => ({
                url: `/admin/wallet/withdrawals/${id}/reject`,
                method: 'POST',
                body: { note },
            }),
            invalidatesTags: ['Withdrawals'],
        }),
    }),
})

export const { useGetWithdrawalRequestsQuery, useApproveWithdrawalMutation, useRejectWithdrawalMutation } = walletApi
