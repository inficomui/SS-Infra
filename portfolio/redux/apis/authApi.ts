import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './locationApi';

export interface OtpSendResponse {
    success: boolean;
    message: string;
    /** Expiry in seconds, e.g. 120 */
    expiresIn?: number;
}

export interface OtpVerifyResponse {
    success: boolean;
    message: string;
    /**
     * Short-lived token returned by the backend after successful OTP verification.
     * Must be sent as `otpToken` in the booking creation request.
     */
    otpToken: string;
    /**
     * Whether the user is already registered in the system.
     */
    is_registered: boolean;
    /**
     * User details if registered.
     */
    user?: {
        name: string;
        email?: string;
    };
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery,
    endpoints: (builder) => ({
        sendOtp: builder.mutation<OtpSendResponse, { mobile: string }>({
            query: (body) => ({
                url: '/auth/send-otp',
                method: 'POST',
                body,
            }),
        }),
        verifyOtp: builder.mutation<OtpVerifyResponse, { mobile: string; otp: string }>({
            query: (body) => ({
                url: '/auth/verify-otp',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { useSendOtpMutation, useVerifyOtpMutation } = authApi;
