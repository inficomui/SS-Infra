import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, AuthResponse } from '../types';
import { CONFIG } from '@/constants/Config';

import { baseQuery } from '../baseQuery';

export interface SendOtpRequest {
    mobile: string;
}

export interface VerifyOtpRequest {
    mobile: string;
    otp: string;
}

// Define the API service
export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery,
    tagTypes: ['User'],
    endpoints: (builder) => ({
        sendOtp: builder.mutation<{ success: boolean; message: string }, SendOtpRequest>({
            query: (credentials) => ({
                url: '/auth/send-otp',
                method: 'POST',
                body: credentials,
            }),
        }),
        verifyOtp: builder.mutation<AuthResponse, VerifyOtpRequest>({
            query: (credentials) => ({
                url: '/auth/verify-otp',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),
        getMe: builder.query<{ success: boolean; user: User }, void>({
            query: () => '/auth/me',
            providesTags: ['User'],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success && data.user) {
                        const { updateUser } = await import('../slices/authSlice');
                        dispatch(updateUser(data.user));
                    }
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                }
            },
        }),
        updateProfile: builder.mutation<{ success: boolean; user: User; message: string }, Partial<User>>({
            query: (data) => ({
                url: '/auth/profile',
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        registerPushToken: builder.mutation<{ success: boolean; message: string }, { pushToken: string }>({
            query: (data) => ({
                url: '/notifications/register-token',
                method: 'POST',
                body: data,
            }),
        }),
        registerOwner: builder.mutation<{ success: boolean; message: string }, any>({
            query: (data) => ({
                url: '/auth/register/owner',
                method: 'POST',
                body: data,
            }),
        }),
        registerOperator: builder.mutation<{ success: boolean; message: string }, any>({
            query: (data) => ({
                url: '/auth/register/operator',
                method: 'POST',
                body: data,
            }),
        }),
        getPublicOwners: builder.query<{ success: boolean; data: { data: any[] } }, { limit?: number }>({
            query: (params) => ({
                url: '/discovery/owners',
                method: 'GET',
                params,
            }),
        }),
    }),
});

// Export hooks for usage in functional components
export const {
    useSendOtpMutation,
    useVerifyOtpMutation,
    useGetMeQuery,
    useUpdateProfileMutation,
    useRegisterPushTokenMutation,
    useRegisterOwnerMutation,
    useRegisterOperatorMutation,
    useGetPublicOwnersQuery,
} = authApi;
