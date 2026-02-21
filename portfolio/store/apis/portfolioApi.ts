import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const portfolioApi = createApi({
    reducerPath: "portfolioApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api" }), // Replace with actual backend URL
    endpoints: (builder) => ({
        getOwners: builder.query<any, { page?: number; location?: string }>({
            query: (params) => ({
                url: "/discovery/owners",
                params,
            }),
        }),
        getOperators: builder.query<any, { page?: number; status?: string }>({
            query: (params) => ({
                url: "/discovery/operators",
                params,
            }),
        }),
        getNearMe: builder.query<any, { lat: number; lng: number; radius: number }>({
            query: (params) => ({
                url: "/discovery/near-me",
                params,
            }),
        }),
        sendOtp: builder.mutation<any, { phone: string }>({
            query: (body) => ({
                url: "/auth/send-otp",
                method: "POST",
                body,
            }),
        }),
        verifyOtp: builder.mutation<any, { phone: string; otp: string }>({
            query: (body) => ({
                url: "/auth/verify-otp",
                method: "POST",
                body,
            }),
        }),
        createEnquiry: builder.mutation<any, any>({
            query: (body) => ({
                url: "/enquiry/create",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const {
    useGetOwnersQuery,
    useGetOperatorsQuery,
    useGetNearMeQuery,
    useSendOtpMutation,
    useVerifyOtpMutation,
    useCreateEnquiryMutation,
} = portfolioApi;
