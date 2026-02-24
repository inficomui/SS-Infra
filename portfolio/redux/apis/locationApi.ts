import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Common base query configuration, handling potential token injection
export const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
});

export const locationApi = createApi({
    reducerPath: 'locationApi',
    baseQuery,
    endpoints: (builder) => ({
        getDistricts: builder.query<{ success: boolean; data: string[] }, void>({
            query: () => ({ url: "/locations/districts", method: "GET" }),
        }),
        getTalukas: builder.query<{ success: boolean; data: string[] }, string>({
            query: (district) => ({
                url: '/locations/talukas',
                params: { district },
            }),
        }),
        getHierarchy: builder.query<{ success: boolean; data: Record<string, string[]> }, void>({
            query: () => '/locations/hierarchy',
        }),
    }),
});

export const { useGetDistrictsQuery, useGetTalukasQuery, useGetHierarchyQuery } = locationApi;
