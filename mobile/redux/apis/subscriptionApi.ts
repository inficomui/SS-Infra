import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CONFIG } from '@/constants/Config';

// Types
export interface Plan {
    id: number;
    name: string;
    type: string;
    durationDays?: number;
    price?: string | number; // API returns price as string e.g. "499.00"
    features?: string[];
}

export interface UserSummary {
    id: number;
    name: string;
    mobile: string;
    role: string;
}

export interface AdminSummary {
    id: number;
    name: string;
}

export interface Subscription {
    id: number;
    user?: UserSummary;
    userId?: number; // In case user object is not returned in some responses
    plan: Plan;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'cancelled';
    daysRemaining: number;
    notes?: string;
    assignedBy?: AdminSummary;
    createdAt: string;
}

export interface AssignPlanRequest {
    userId: number;
    planId: number;
    startDate?: string;
    notes?: string;
}

export interface AssignPlanResponse {
    success: boolean;
    message: string;
    subscription: Subscription;
}

export interface CancelSubscriptionResponse {
    success: boolean;
    message: string;
    subscription?: Subscription; // For soft delete (status: 'cancelled')
    deletedSubscription?: { id: number; userId: number; userName: string }; // For hard delete
}

export interface GetMySubscriptionResponse {
    success: boolean;
    isActive: boolean; // Use THIS field to check subscription status, not subscription !== null
    message: string;
    subscription: Subscription | null;
}

export interface GetUserSubscriptionsResponse {
    success: boolean;
    user: UserSummary;
    subscriptions: Subscription[];
    totalSubscriptions: number;
}

export interface GetAllSubscriptionsResponse {
    success: boolean;
    subscriptions: Subscription[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}

export interface GetAllSubscriptionsParams {
    status?: 'active' | 'expired' | 'cancelled';
    planId?: number;
    limit?: number;
    page?: number;
}

import { baseQuery } from '../baseQuery';

// API Definition
export const subscriptionApi = createApi({
    reducerPath: 'subscriptionApi',
    baseQuery,
    tagTypes: ['Subscriptions', 'UserSubscriptions'],
    endpoints: (builder) => ({
        assignPlan: builder.mutation<AssignPlanResponse, AssignPlanRequest>({
            query: (data) => ({
                url: '/subscriptions/assign',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Subscriptions', 'UserSubscriptions'],
            transformResponse: (response: AssignPlanResponse) => {
                return response;
            },
        }),

        // 2. Cancel/Delete Subscription (Admin Only)
        cancelSubscription: builder.mutation<CancelSubscriptionResponse, { id: number; softDelete?: boolean }>({
            query: ({ id, softDelete = false }) => ({
                url: `/subscriptions/${id}`,
                method: 'DELETE',
                body: { softDelete }, // softDelete goes in the request body, not query params
            }),
            invalidatesTags: ['Subscriptions', 'UserSubscriptions'],
            transformResponse: (response: CancelSubscriptionResponse) => {
                return response;
            },
        }),

        // 3. Get User's Subscriptions (Admin Only)
        getUserSubscriptions: builder.query<GetUserSubscriptionsResponse, number>({
            query: (userId) => `/subscriptions/user/${userId}`,
            providesTags: (result, error, userId) => [{ type: 'UserSubscriptions', id: userId }],
            transformResponse: (response: GetUserSubscriptionsResponse) => {
                return response;
            },
        }),

        getAllSubscriptions: builder.query<GetAllSubscriptionsResponse, GetAllSubscriptionsParams>({
            query: (params) => ({
                url: '/subscriptions',
                params,
            }),
            providesTags: ['Subscriptions'],
            transformResponse: (response: GetAllSubscriptionsResponse) => {
                return response;
            },
        }),
        // 5. Get Logged-in User's Active Subscription
        getMySubscription: builder.query<GetMySubscriptionResponse, void>({
            query: () => '/subscriptions/my',
            providesTags: ['UserSubscriptions'],
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                } catch (err) {
                    console.error('--- [subscriptions/my] Request FAILED ---', err);
                }
            },
            transformResponse: (response: GetMySubscriptionResponse) => {
                return response;
            },
        }),
    }),
});

export const {
    useAssignPlanMutation,
    useCancelSubscriptionMutation,
    useGetUserSubscriptionsQuery,
    useGetAllSubscriptionsQuery,
    useGetMySubscriptionQuery,
} = subscriptionApi;
