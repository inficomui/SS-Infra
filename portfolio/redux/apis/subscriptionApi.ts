import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './locationApi';

export interface Plan {
    id: number;
    name: string;
    type: string;
    durationDays?: number;
    price?: number;
    features?: string[];
}

export const subscriptionApi = createApi({
    reducerPath: 'subscriptionApi',
    baseQuery,
    endpoints: (builder) => ({
        getPlans: builder.query<{ success: boolean; data: Plan[] }, void>({
            query: () => '/plans',
        }),
    }),
});

export const { useGetPlansQuery } = subscriptionApi;
